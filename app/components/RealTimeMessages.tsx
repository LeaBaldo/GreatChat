import { useSupabase } from "~/hooks/useSupabase"
import { useEffect, useState } from "react"
import { Database } from "~/types/database"

type Message = Database['public']['Tables']['messages']['Row']

export function RealTimeMessages({
    serverMessages
}: {
    serverMessages: Message[]
}) {
    console.log({serverMessages})

    const [messages, setMessages] = useState<Message[]>(serverMessages)
    const supabase = useSupabase()


    useEffect(() => {
        setMessages(serverMessages)
    }, [serverMessages])
    
    useEffect(() =>{
        const channel = supabase
            .channel('*')
            .on(
                'postgres_changes', // broadcast
                {
                     event: 'INSERT', 
                     schema: 'public', 
                     table: 'messages'
                    }, // filter
            (payload) => { //callback
                const newMessage = payload.new as Message
                setMessages((messages) => [...messages, newMessage])
                
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [supabase])

    return (
        <pre>
         {JSON.stringify(messages, null, 2)}
        </pre>
    )
}
