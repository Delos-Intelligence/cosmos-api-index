"use client";

// components/chat-dialog.tsx

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X } from "lucide-react";
import React, { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatDialogProps {
  indexName: string;
  indexUuid: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatDialog: React.FC<ChatDialogProps> = ({
  indexName,
  isOpen,
  indexUuid,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      role: "user",
      content: inputMessage,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      //   // TODO: Integrate with your backend API
      //   // const response = await fetch('/api/chat', {
      //   //   method: 'POST',
      //   //   body: JSON.stringify({
      //   //     indexName,
      //   //     message: inputMessage
      //   //   })
      //   // });
      //   // const data = await response.json();

      //   // Simulate backend response for now
      //   setTimeout(() => {
      //     setMessages((prev) => [
      //       ...prev,
      //       {
      //         role: "assistant",
      //         content: `This is a simulated response for "${inputMessage}" related to index "${indexName}"`,
      //       },
      //     ]);
      //     setIsLoading(false);
      //   }, 1000);
      // } catch (error) {
      //   setMessages((prev) => [
      //     ...prev,
      //     {
      //       role: "assistant",
      //       content: "Sorry, there was an error processing your request.",
      //     },
      //   ]);
      //   setIsLoading(false);
      // }
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          indexUuid,
          question: inputMessage,
          outputLanguage: "en",
          activeFilesHashes: [],
        }),
      });
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
        },
      ]);
      setIsLoading(false);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleEmbedIndex = async () => {
    try {
      const response = await fetch(`/api/embed/${indexUuid}`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to embed index");
      }
      // Handle success if necessary
    } catch (error) {
      // Handle error
      console.error("Error embedding index:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Chat with {indexName}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-[400px] pr-4">
            {messages.map((message, index) => (
              <div
                key={index}
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
            {isLoading && (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                Thinking...
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <CardFooter className="border-t p-4">
          <div className="flex w-full gap-2">
            <Input
              placeholder="Ask a question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
            <Button onClick={handleEmbedIndex}>Embed Index</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
