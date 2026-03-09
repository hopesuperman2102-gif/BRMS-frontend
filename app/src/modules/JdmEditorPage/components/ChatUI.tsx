'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Stack,
  Typography,
  Paper,
  Avatar,
  Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { brmsTheme } from '@/core/theme/brmsTheme';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatUIProps {
  selectedRule?: string | number | null;
}

export default function ChatUI({ selectedRule }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your JDM Editor Assistant. How can I help you with your decision rules today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate API response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content:
          'I\'m processing your request. In a real implementation, this would call an AI API to generate helpful suggestions about your JDM rules.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: brmsTheme.colors.white,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${brmsTheme.colors.lightBorder}`,
          backgroundColor: brmsTheme.colors.formBg,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '0.95rem',
            color: brmsTheme.colors.lightTextHigh,
          }}
        >
          Chat Assistant
        </Typography>
        <Typography
          sx={{
            fontSize: '0.75rem',
            color: brmsTheme.colors.lightTextMid,
            mt: 0.5,
          }}
        >
          {selectedRule ? `Discussing Rule: ${selectedRule}` : 'Ready to assist'}
        </Typography>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: brmsTheme.colors.white,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: brmsTheme.colors.lightBorder,
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: brmsTheme.colors.lightBorderHover,
          },
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent:
                message.type === 'user' ? 'flex-end' : 'flex-start',
              gap: 1.5,
            }}
          >
            {message.type === 'assistant' && (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: brmsTheme.colors.primary,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                }}
              >
                AI
              </Avatar>
            )}

            <Paper
              sx={{
                maxWidth: '85%',
                p: 1.5,
                backgroundColor:
                  message.type === 'user'
                    ? brmsTheme.colors.primary
                    : brmsTheme.colors.formBg,
                color:
                  message.type === 'user'
                    ? '#ffffff'
                    : brmsTheme.colors.lightTextHigh,
                borderRadius: 2,
                boxShadow:
                  message.type === 'user'
                    ? `0 4px 12px rgba(101, 82, 208, 0.15)`
                    : `0 1px 3px rgba(0, 0, 0, 0.05)`,
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                }}
              >
                {message.content}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  opacity: 0.6,
                  mt: 0.75,
                }}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Paper>
          </Box>
        ))}

        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              gap: 1.5,
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: brmsTheme.colors.primary,
                fontSize: '0.9rem',
                fontWeight: 700,
              }}
            >
              AI
            </Avatar>
            <Paper
              sx={{
                p: 1.5,
                backgroundColor: brmsTheme.colors.formBg,
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: brmsTheme.colors.primary,
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite',
                    '@keyframes bounce': {
                      '0%, 100%': { opacity: 0.3 },
                      '50%': { opacity: 1 },
                    },
                  }}
                />
                <Box
                  sx={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: brmsTheme.colors.primary,
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite 0.2s',
                    '@keyframes bounce': {
                      '0%, 100%': { opacity: 0.3 },
                      '50%': { opacity: 1 },
                    },
                  }}
                />
                <Box
                  sx={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: brmsTheme.colors.primary,
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite 0.4s',
                    '@keyframes bounce': {
                      '0%, 100%': { opacity: 0.3 },
                      '50%': { opacity: 1 },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Divider />
      <Box sx={{ p: 2, backgroundColor: brmsTheme.colors.white }}>
        <form onSubmit={handleSendMessage}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask something..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: brmsTheme.colors.formBg,
                },
              }}
            />
            <IconButton
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              sx={{
                color: brmsTheme.colors.primary,
                '&:hover': {
                  backgroundColor: brmsTheme.colors.formBg,
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}


