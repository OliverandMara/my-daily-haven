import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export default function DashCard({ title, children, className, action }: DashCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("rounded-2xl border border-border bg-card p-4 shadow-sm", className)}
    >
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between">
          {title && <h3 className="text-sm font-bold text-foreground">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </motion.div>
  );
}
