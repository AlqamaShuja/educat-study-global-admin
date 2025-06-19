import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useNotifications from '../../hooks/useNotifications';
import messageService from '../../services/messageService';
import Button from '../ui/Button';
// import Textarea from "../ui/Textarea";
import Input from '../ui/Input';
import { Paperclip, Send } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

// Zod schema for message validation
const messageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message cannot exceed 2000 characters'),
  recipientId: z.string().min(1, 'Recipient is required'),
  attachments: z.array(z.instanceof(File)).optional(),
});

// Default form values
const defaultValues = {
  content: '',
  recipientId: '',
  attachments: [],
};

const MessageComposer = ({ recipientId, onMessageSent }) => {
  const { addNotification } = useNotifications();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const { success, error } = useToast();

  // Form setup with React Hook Form and Zod
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      ...defaultValues,
      recipientId: recipientId || '',
    },
  });

  const attachments = watch('attachments');

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('content', data.content);
      formData.append('recipientId', data.recipientId);
      if (data.attachments?.length) {
        data.attachments.forEach((file) => {
          formData.append('attachments', file);
        });
      }
      const response = await messageService.sendMessage(formData);
      success('Message sent successfully');
      reset();
      if (onMessageSent) onMessageSent(response);
      addNotification({
        type: 'success',
        message: 'Message sent to recipient',
      });
    } catch (err) {
      error(err.message || 'Failed to send message');
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setValue('attachments', files);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setValue('attachments', files);
  };

  // Trigger file input click
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`p-4 bg-background border border-border rounded-lg shadow-sm ${
        isDragging ? 'border-dashed border-2 border-primary bg-primary/10' : ''
      }`}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex flex-col gap-4'
        aria-label='Compose message form'
      >
        <div
          className='relative'
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* <Textarea
            {...register("content")}
            placeholder="Type your message..."
            className="w-full min-h-[100px] p-3 rounded-md border border-border bg-input text-foreground resize-y focus:border-primary focus:ring-2 focus:ring-primary/20"
            aria-invalid={errors.content ? "true" : "false"}
            aria-describedby={errors.content ? "content-error" : undefined}
            disabled={isSubmitting}
          /> */}
          {errors.content && (
            <span
              id='content-error'
              className='text-sm text-destructive mt-1 block'
            >
              {errors.content.message}
            </span>
          )}
        </div>

        <input type='hidden' {...register('recipientId')} aria-hidden='true' />

        <div className='flex justify-between items-center gap-4 flex-wrap'>
          <div className='flex items-center gap-2 flex-wrap'>
            <Button
              type='button'
              variant='outline'
              onClick={handleAttachmentClick}
              disabled={isSubmitting}
              className='flex items-center gap-2'
              aria-label='Attach files'
            >
              <Paperclip size={16} />
              <span>Attach</span>
            </Button>
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept='.pdf,.doc,.docx,.jpg,.png'
              className='hidden'
              aria-hidden='true'
            />
            {attachments?.length > 0 && (
              <div className='flex gap-2 flex-wrap'>
                {attachments.map((file, index) => (
                  <span
                    key={index}
                    className='bg-secondary text-secondary-foreground text-sm px-2 py-1 rounded'
                  >
                    {file.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button
            type='submit'
            disabled={isSubmitting}
            className='flex items-center gap-2'
            aria-label='Send message'
          >
            <Send size={16} />
            <span>{isSubmitting ? 'Sending...' : 'Send'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessageComposer;
