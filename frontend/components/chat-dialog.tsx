"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Index } from "@/types";
import { Send, X } from "lucide-react";
import React, { useState } from "react";

const ChatDialog: React.FC<{
  index: Index;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (indexId: string, message: string) => Promise<void>;
}> = ({ index, isOpen, onClose, onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    await onSendMessage(index.id, inputMessage);
    setInputMessage("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Chat with {index.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-[400px] pr-4">
            {index.messages.map((message, idx) => (
              <div
                key={idx}
                className={`mb-4 ${
                  message.role === "user" ? "ml-auto" : "mr-auto"
                } max-w-[80%]`}
              >
                <div
                  className={`p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {index.isLoading && (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                Thinking...
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <CardContent className="border-t p-4">
          <div className="flex w-full gap-2">
            <Input
              placeholder="Ask a question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} disabled={index.isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatDialog;
