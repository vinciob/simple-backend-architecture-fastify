export const logger = (
    message: string, 
    level: "info" | "error" | "warn" = "info"
) => {
    
    // Add timestamp to the log message
    const now = new Date().toISOString()
    const messageToLog = `${now} - ${message}`

    // Handle console log 
    if (level === "error") console.error(messageToLog)
    else if (level === "warn") console.warn(messageToLog)
    else console.log(messageToLog)

    // handle other tools logging
    // ...
}