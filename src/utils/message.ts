export function isTextMessage(message: any): message is { text: string } {
  return message && typeof message.text === "string";
}

export function isCallbackQuery(message: any): message is { data: string } {
  return message && typeof message.data === "string";
}
