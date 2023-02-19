import { createContext, useCallback, useEffect, useState } from "react"
import useSocket from "../hooks/useSocket"
import peer from "../rtcpeer"

export const PeerContext = createContext(null)

const PeerProvider = ({ children }) => {
    const [localStream, setLocalStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null)
    const [remoteUser, setRemoteUser] = useState({})

    const { socket } = useSocket()

    const sendConnRequest = useCallback(async (to) => {
        const offer = await peer.createOffer()
        await peer.setLocalDescription(new RTCSessionDescription(offer))

        console.log({ to, offer })

        setRemoteUser(to)

        socket.emit('conn:request', { to, offer })
    }, [socket.id])

    const handleConnRequest = useCallback(async ({ from, offer }) => {
        console.log({ from, offer })

        await peer.setRemoteDescription(new RTCSessionDescription(offer))

        const answer = await peer.createAnswer()
        await peer.setLocalDescription(new RTCSessionDescription(answer))

        socket.emit('conn:response', { to: from, answer })

    }, [socket.id, localStream])

    const handleConnResponse = useCallback(async ({ from, answer }) => {
        console.log({ from, answer })

        await peer.setRemoteDescription(new RTCSessionDescription(answer))

    }, [socket.id, localStream])

    const handleTrackEvent = useCallback(({ streams }) => {
        console.log("remote stream" + streams[0])

        setRemoteStream(streams[0])
    }, [peer])

    const handleNegotiation = useCallback(async () => {
        sendConnRequest(remoteUser)
    }, [peer, socket.id])

    const sendMediaStream = useCallback(() => {

        localStream.getTracks().forEach((track) => peer.addTrack(track, localStream))
    }, [peer, socket.id, localStream])

    useEffect(() => {
        const action = async () => {
            const localMedia = await navigator.mediaDevices.getUserMedia({ video: true })

            setLocalStream(localMedia)

            console.log("localstream loaded")
        }

        action()
    }, [])

    useEffect(() => {
        peer.addEventListener('track', handleTrackEvent)
        peer.addEventListener('negotiationneeded', handleNegotiation)

        return () => {
            peer.removeEventListener('track', handleTrackEvent)
            peer.removeEventListener('negotiationneeded', handleNegotiation)
        }
    }, [peer, handleTrackEvent, handleNegotiation])

    useEffect(() => {
        socket.on('conn:request', handleConnRequest)
        socket.on('conn:response', handleConnResponse)

        return () => {
            socket.off('conn:request', handleConnRequest)
            socket.off('conn:response', handleConnResponse)
        }
    }, [socket.id, handleConnRequest, handleConnResponse])

    return (
        <PeerContext.Provider value={{ sendConnRequest, localStream, remoteStream, sendMediaStream }}>
            {children}
        </PeerContext.Provider>
    )
}

export default PeerProvider
