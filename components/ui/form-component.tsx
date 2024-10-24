/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { track } from '@vercel/analytics';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import useWindowSize from '@/hooks/use-window-size';
import { Sparkles, X, Zap, Cpu } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils';

interface ModelSwitcherProps {
    selectedModel: string;
    setSelectedModel: (value: string) => void;
    className?: string;
}

const models = [
    { value: "azure:gpt4o-mini", label: "GPT-4o Mini", icon: Zap, description: "High speed, good quality", color: "emerald" },
    { value: "anthropic:claude-3-5-sonnet-latest", label: "Claude 3.5 Sonnet (New)", icon: Sparkles, description: "High quality, lower speed", color: "indigo" },
    { value: "azure:gpt-4o", label: "GPT-4o", icon: Cpu, description: "Higher quality, normal speed", color: "blue" },
];


const getColorClasses = (color: string, isSelected: boolean = false) => {
    const baseClasses = "transition-colors duration-200";
    const selectedClasses = isSelected ? "!bg-opacity-90 dark:!bg-opacity-90" : "";

    switch (color) {
        case 'emerald':
            return isSelected
                ? `${baseClasses} ${selectedClasses} !bg-emerald-500 dark:!bg-emerald-600 !text-white hover:!bg-emerald-600 dark:hover:!bg-emerald-700`
                : `${baseClasses} !text-emerald-700 dark:!text-emerald-300 hover:!bg-emerald-200 dark:hover:!bg-emerald-800/70`;
        case 'indigo':
            return isSelected
                ? `${baseClasses} ${selectedClasses} !bg-indigo-500 dark:!bg-indigo-600 !text-white hover:!bg-indigo-600 dark:hover:!bg-indigo-700`
                : `${baseClasses} !text-indigo-700 dark:!text-indigo-300 hover:!bg-indigo-200 dark:hover:!bg-indigo-800/70`;
        case 'blue':
            return isSelected
                ? `${baseClasses} ${selectedClasses} !bg-blue-500 dark:!bg-blue-600 !text-white hover:!bg-blue-600 dark:hover:!bg-blue-700`
                : `${baseClasses} !text-blue-700 dark:!text-blue-300 hover:!bg-blue-200 dark:hover:!bg-blue-800/70`;
        default:
            return isSelected
                ? `${baseClasses} ${selectedClasses} !bg-neutral-500 dark:!bg-neutral-600 !text-white hover:!bg-neutral-600 dark:hover:!bg-neutral-700`
                : `${baseClasses} !text-neutral-700 dark:!text-neutral-300 hover:!bg-neutral-200 dark:hover:!bg-neutral-800/70`;
    }
}


const ModelSwitcher: React.FC<ModelSwitcherProps> = ({ selectedModel, setSelectedModel, className }) => {
    const selectedModelData = models.find(model => model.value === selectedModel) || models[0];
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger
                className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
                    getColorClasses(selectedModelData.color, true),
                    "focus:outline-none focus:ring-2 focus:ring-opacity-50",
                    `focus:ring-${selectedModelData.color}-500`,
                    className
                )}
            >
                <selectedModelData.icon className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[220px] p-1 !font-sans rounded-md shadow-md bg-white dark:bg-neutral-800 ml-4 sm:m-auto">
                {models.map((model) => (
                    <DropdownMenuItem
                        key={model.value}
                        onSelect={() => setSelectedModel(model.value)}
                        className={cn(
                            "flex items-start gap-2 px-2 py-1.5 rounded-md text-xs mb-1 last:mb-0",
                            getColorClasses(model.color, selectedModel === model.value)
                        )}
                    >
                        <model.icon className={cn(
                            "w-4 h-4 mt-0.5",
                            selectedModel === model.value ? "text-white" : `text-${model.color}-500 dark:text-${model.color}-400`
                        )} />
                        <div>
                            <div className="font-bold">{model.label}</div>
                            <div className="text-xs opacity-70">{model.description}</div>
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


interface Attachment {
    name: string;
    contentType: string;
    url: string;
    size: number;
}

const ArrowUpIcon = ({ size = 16 }: { size?: number }) => {
    return (
        <svg
            height={size}
            strokeLinejoin="round"
            viewBox="0 0 16 16"
            width={size}
            style={{ color: "currentcolor" }}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.70711 1.39644C8.31659 1.00592 7.68342 1.00592 7.2929 1.39644L2.21968 6.46966L1.68935 6.99999L2.75001 8.06065L3.28034 7.53032L7.25001 3.56065V14.25V15H8.75001V14.25V3.56065L12.7197 7.53032L13.25 8.06065L14.3107 6.99999L13.7803 6.46966L8.70711 1.39644Z"
                fill="currentColor"
            ></path>
        </svg>
    );
};

const StopIcon = ({ size = 16 }: { size?: number }) => {
    return (
        <svg
            height={size}
            viewBox="0 0 16 16"
            width={size}
            style={{ color: "currentcolor" }}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3 3H13V13H3V3Z"
                fill="currentColor"
            ></path>
        </svg>
    );
};

const PaperclipIcon = ({ size = 16 }: { size?: number }) => {
    return (
        <svg
            height={size}
            strokeLinejoin="round"
            viewBox="0 0 16 16"
            width={size}
            style={{ color: "currentcolor" }}
            className="-rotate-45"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.8591 1.70735C10.3257 1.70735 9.81417 1.91925 9.437 2.29643L3.19455 8.53886C2.56246 9.17095 2.20735 10.0282 2.20735 10.9222C2.20735 11.8161 2.56246 12.6734 3.19455 13.3055C3.82665 13.9376 4.68395 14.2927 5.57786 14.2927C6.47178 14.2927 7.32908 13.9376 7.96117 13.3055L14.2036 7.06304L14.7038 6.56287L15.7041 7.56321L15.204 8.06337L8.96151 14.3058C8.06411 15.2032 6.84698 15.7074 5.57786 15.7074C4.30875 15.7074 3.09162 15.2032 2.19422 14.3058C1.29682 13.4084 0.792664 12.1913 0.792664 10.9222C0.792664 9.65305 1.29682 8.43592 2.19422 7.53852L8.43666 1.29609C9.07914 0.653606 9.95054 0.292664 10.8591 0.292664C11.7678 0.292664 12.6392 0.653606 13.2816 1.29609C13.9241 1.93857 14.2851 2.80997 14.2851 3.71857C14.2851 4.62718 13.9241 5.49858 13.2816 6.14106L13.2814 6.14133L7.0324 12.3835C7.03231 12.3836 7.03222 12.3837 7.03213 12.3838C6.64459 12.7712 6.11905 12.9888 5.57107 12.9888C5.02297 12.9888 4.49731 12.7711 4.10974 12.3835C3.72217 11.9959 3.50444 11.4703 3.50444 10.9222C3.50444 10.3741 3.72217 9.8484 4.10974 9.46084L4.11004 9.46054L9.877 3.70039L10.3775 3.20051L11.3772 4.20144L10.8767 4.70131L5.11008 10.4612C5.11005 10.4612 5.11003 10.4612 5.11 10.4613C4.98779 10.5835 4.91913 10.7493 4.91913 10.9222C4.91913 11.0951 4.98782 11.2609 5.11008 11.3832C5.23234 11.5054 5.39817 11.5741 5.57107 11.5741C5.74398 11.5741 5.9098 11.5054 6.03206 11.3832L6.03233 11.3829L12.2813 5.14072C12.2814 5.14063 12.2815 5.14054 12.2816 5.14045C12.6586 4.7633 12.8704 4.25185 12.8704 3.71857C12.8704 3.18516 12.6585 2.6736 12.2813 2.29643C11.9041 1.91925 11.3926 1.70735 10.8591 1.70735Z"
                fill="currentColor"
            ></path>
        </svg>
    );
};


const MAX_IMAGES = 3;

interface FormComponentProps {
    input: string;
    setInput: (input: string) => void;
    attachments: Array<Attachment>;
    setAttachments: React.Dispatch<React.SetStateAction<Array<Attachment>>>;
    hasSubmitted: boolean;
    setHasSubmitted: (value: boolean) => void;
    isLoading: boolean;
    handleSubmit: (
        event?: {
            preventDefault?: () => void;
        },
        chatRequestOptions?: ChatRequestOptions,
    ) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    inputRef: React.RefObject<HTMLTextAreaElement>;
    stop: () => void;
    messages: Array<Message>;
    append: (
        message: Message | CreateMessage,
        chatRequestOptions?: ChatRequestOptions,
    ) => Promise<string | null | undefined>;
    selectedModel: string;
    setSelectedModel: (value: string) => void;
    resetSuggestedQuestions: () => void;
}

const AttachmentPreview: React.FC<{ attachment: Attachment | UploadingAttachment, onRemove: () => void, isUploading: boolean }> = ({ attachment, onRemove, isUploading }) => {
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const isUploadingAttachment = (attachment: Attachment | UploadingAttachment): attachment is UploadingAttachment => {
        return 'progress' in attachment;
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="relative flex items-center bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 pr-8 gap-2 shadow-sm flex-shrink-0"
        >
            {isUploading ? (
                <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-neutral-500 dark:text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : isUploadingAttachment(attachment) ? (
                <div className="w-10 h-10 flex items-center justify-center">
                    <div className="relative w-8 h-8">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                                className="text-neutral-300 dark:text-neutral-600 stroke-current"
                                strokeWidth="10"
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                            ></circle>
                            <circle
                                className="text-primary stroke-current"
                                strokeWidth="10"
                                strokeLinecap="round"
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                                strokeDasharray={`${attachment.progress * 251.2}, 251.2`}
                                transform="rotate(-90 50 50)"
                            ></circle>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{Math.round(attachment.progress * 100)}%</span>
                        </div>
                    </div>
                </div>
            ) : (
                <img
                    src={(attachment as Attachment).url}
                    alt={`Preview of ${attachment.name}`}
                    width={40}
                    height={40}
                    className="rounded-lg h-10 w-10 object-cover"
                />
            )}
            <div className="flex-grow min-w-0">
                {!isUploadingAttachment(attachment) && (
                    <p className="text-sm font-medium truncate text-neutral-800 dark:text-neutral-200">{attachment.name}</p>
                )}
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {isUploadingAttachment(attachment)
                        ? 'Uploading...'
                        : formatFileSize((attachment as Attachment).size)}
                </p>
            </div>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="absolute -top-2 -right-2 p-0.5 m-0 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors z-20"
            >
                <X className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            </motion.button>
        </motion.div>
    );
};

interface UploadingAttachment {
    file: File;
    progress: number;
}

const FormComponent: React.FC<FormComponentProps> = ({
    input,
    setInput,
    attachments,
    setAttachments,
    hasSubmitted,
    setHasSubmitted,
    isLoading,
    handleSubmit,
    fileInputRef,
    inputRef,
    stop,
    messages,
    append,
    selectedModel,
    setSelectedModel,
    resetSuggestedQuestions,
}) => {
    const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);
    const { width } = useWindowSize();
    const postSubmitFileInputRef = useRef<HTMLInputElement>(null);

    const adjustHeight = useCallback(() => {
        if (inputRef.current) {
            inputRef.current.style.height = "auto";
            inputRef.current.style.height = `${inputRef.current.scrollHeight + 2}px`;
        }
    }, [inputRef]);

    useEffect(() => {
        if (inputRef.current) {
            adjustHeight();
        }
    }, [adjustHeight, input, inputRef]);

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(event.target.value);
        adjustHeight();
    };

    const uploadFile = async (file: File): Promise<Attachment> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error('Failed to upload file');
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            toast.error("Failed to upload file, please try again!");
            throw error;
        }
    };

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const totalAttachments = attachments.length + files.length;

        if (totalAttachments > MAX_IMAGES) {
            toast.error(`You can only attach up to ${MAX_IMAGES} images.`);
            return;
        }

        setUploadQueue(files.map((file) => file.name));

        try {
            const uploadPromises = files.map((file) => uploadFile(file));
            const uploadedAttachments = await Promise.all(uploadPromises);
            setAttachments((currentAttachments) => [
                ...currentAttachments,
                ...uploadedAttachments,
            ]);
        } catch (error) {
            console.error("Error uploading files!", error);
            toast.error("Failed to upload one or more files. Please try again.");
        } finally {
            setUploadQueue([]);
            event.target.value = '';
        }
    }, [attachments, setAttachments]);

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (input.trim() || attachments.length > 0) {
            setHasSubmitted(true);
            track("search input", {query: input.trim()})

            handleSubmit(event, {
                experimental_attachments: attachments,
            });

            setAttachments([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } else {
            toast.error("Please enter a search query or attach an image.");
        }
    }, [input, attachments, setHasSubmitted, handleSubmit, setAttachments, fileInputRef]);

    const submitForm = useCallback(() => {
        onSubmit({ preventDefault: () => { }, stopPropagation: () => { } } as React.FormEvent<HTMLFormElement>);
        resetSuggestedQuestions();

        if (width && width > 768) {
            inputRef.current?.focus();
        }
    }, [onSubmit, resetSuggestedQuestions, width, inputRef]);

    const triggerFileInput = useCallback(() => {
        if (attachments.length >= MAX_IMAGES) {
            toast.error(`You can only attach up to ${MAX_IMAGES} images.`);
            return;
        }

        if (hasSubmitted) {
            postSubmitFileInputRef.current?.click();
        } else {
            fileInputRef.current?.click();
        }
    }, [attachments.length, hasSubmitted, fileInputRef]);


    return (
        <div className={cn(
            "relative w-full flex flex-col gap-2 rounded-lg transition-all duration-300",
            attachments.length > 0 || uploadQueue.length > 0
                ? "bg-gray-100/70 dark:bg-neutral-800 p-1"
                : "bg-transparent"
        )}>
            <input type="file" className="hidden" ref={fileInputRef} multiple onChange={handleFileChange} tabIndex={-1} />
            <input type="file" className="hidden" ref={postSubmitFileInputRef} multiple onChange={handleFileChange} tabIndex={-1} />

            {(attachments.length > 0 || uploadQueue.length > 0) && (
                <div className="flex flex-row gap-2 overflow-x-auto py-2 max-h-32 z-10">
                    {attachments.map((attachment, index) => (
                        <AttachmentPreview
                            key={attachment.url}
                            attachment={attachment}
                            onRemove={() => removeAttachment(index)}
                            isUploading={false}
                        />
                    ))}
                    {uploadQueue.map((filename) => (
                        <AttachmentPreview
                            key={filename}
                            attachment={{
                                url: "",
                                name: filename,
                                contentType: "",
                                size: 0,
                            } as Attachment}
                            onRemove={() => { }}
                            isUploading={true}
                        />
                    ))}
                </div>
            )}

            <div className="relative">
                <Textarea
                    ref={inputRef}
                    placeholder={hasSubmitted ? "Ask a new question..." : "Ask a question..."}
                    value={input}
                    onChange={handleInput}
                    disabled={isLoading}
                    className={cn(
                        "min-h-[48px] overflow-hidden resize-none rounded-lg text-base",
                        "bg-neutral-100 dark:bg-neutral-900",
                        "text-neutral-900 dark:text-neutral-100",
                        "border border-neutral-200 dark:border-neutral-700",
                        "focus:border-neutral-300 dark:focus:border-neutral-600",
                        "focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600",
                        "pr-20 py-2"
                    )}
                    rows={3}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            if (isLoading) {
                                toast.error("Please wait for the model to finish its response!");
                            } else {
                                submitForm();
                            }
                        }
                    }}
                />

                <div className="absolute left-2 bottom-2">
                    <ModelSwitcher
                        selectedModel={selectedModel}
                        setSelectedModel={setSelectedModel}
                    />
                </div>

                <div className="absolute right-2 bottom-2 flex items-center gap-2">
                    <Button
                        className="rounded-full p-1.5 h-8 w-8 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600"
                        onClick={(event) => {
                            event.preventDefault();
                            triggerFileInput();
                        }}
                        variant="outline"
                        disabled={isLoading}
                    >
                        <PaperclipIcon size={14} />
                    </Button>

                    {isLoading ? (
                        <Button
                            className="rounded-full p-1.5 h-8 w-8"
                            onClick={(event) => {
                                event.preventDefault();
                                stop();
                            }}
                            variant="destructive"
                        >
                            <StopIcon size={14} />
                        </Button>
                    ) : (
                        <Button
                            className="rounded-full p-1.5 h-8 w-8 "
                            onClick={(event) => {
                                event.preventDefault();
                                submitForm();
                            }}
                            disabled={input.length === 0 && attachments.length === 0 || uploadQueue.length > 0}
                        >
                            <ArrowUpIcon size={14} />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FormComponent;