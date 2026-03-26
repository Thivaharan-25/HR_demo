import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

/**
 * ThemeToggle — pill-style light/dark switch.
 * Controlled via isDark + onToggle props so it plugs
 * into the app-level ThemeCtx without owning state itself.
 */
export function ThemeToggle({ isDark = false, onToggle }) {
  return (
    <motion.div
      onClick={onToggle}
      whileTap={{ scale: 0.93 }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onToggle?.()}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        display: "flex",
        alignItems: "center",
        width: 56,
        height: 28,
        borderRadius: 14,
        padding: "0 3px",
        cursor: "pointer",
        flexShrink: 0,
        background: isDark ? "#0A0F1E" : "#F1F5F9",
        border: isDark ? "1px solid #1F2937" : "1px solid #E2E8F0",
        transition: "background 0.3s, border-color 0.3s",
        justifyContent: isDark ? "flex-start" : "flex-end",
      }}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: isDark ? "#1F2937" : "#FFFFFF",
          boxShadow: isDark
            ? "0 0 0 1px #374151"
            : "0 1px 4px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isDark ? (
          <Moon size={12} color="#818CF8" strokeWidth={2} />
        ) : (
          <Sun size={12} color="#F59E0B" strokeWidth={2} />
        )}
      </motion.div>
    </motion.div>
  );
}
