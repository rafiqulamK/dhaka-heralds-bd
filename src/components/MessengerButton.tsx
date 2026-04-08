import { MessageCircle } from 'lucide-react';

export default function MessengerButton() {
  return (
    <a
      href="https://m.me/DhakaHerald"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
      title="Chat with us on Messenger"
    >
      <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-accent rounded-full border-2 border-background animate-pulse" />
    </a>
  );
}
