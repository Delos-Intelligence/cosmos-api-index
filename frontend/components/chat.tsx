"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Message } from "@/types";
import { useAskQuestion } from "@/hooks/use-queries";

interface ChatProps {
  indexId: string;
  activeFiles: string[];
}

export default function Chat({ indexId, activeFiles }: ChatProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const askQuestionMutation = useAskQuestion();

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indexId || !question) return;
    setQuestion("");
    const newMessage: Message = { content: question, role: "user" };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const response = await askQuestionMutation.mutateAsync({
        indexId,
        question,
        activeFilesHashes: activeFiles,
      });

      const answerMessage: Message = {
        content: response.data.answer,
        role: "assistant",
      };
      setMessages((prev) => [...prev, answerMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        content: "Failed to get answer. Please try again.",
        role: "assistant",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <Card className="h-[450px]">
      <CardHeader>
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-50 ml-auto w-3/4"
                  : "bg-gray-100 w-3/4"
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleAskQuestion} className="flex w-full gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
          />
          <Button type="submit">Send</Button>
        </form>
      </CardFooter>
    </Card>
  );
}
