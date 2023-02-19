import { useCallback, useEffect, useMemo, useState } from "react"
import socket from "../socket"

const useSocket = () => {
    const [users, setUsers] = useState([])

    const handleNewUser = useCallback((user) => {
        setUsers(user)
    }, [])

    useEffect(() => {
        socket.on('response:users', handleNewUser)

        return () => {
            socket.off('response:users', handleNewUser)
        }
    }, [socket.id])

    return {
        socket,
        users
    }
}

export default useSocket
