"use client"
import { FeatureBadge } from "@/components/ui/feature-badge"
import { motion } from "framer-motion"

export function ServiceBadges() {
  return (
    <div className="flex flex-col space-y-3 p-4 bg-white/5 dark:bg-black/20 rounded-lg border border-white/10">
      <h3 className="text-sm font-semibold">Why Choose Levl</h3>

      <div className="space-y-2">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FeatureBadge type="ai" />
          <span className="text-sm text-black/70 dark:text-white/70">
            Smart matching technology finds the perfect service for your needs
          </span>
        </motion.div>

        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FeatureBadge type="founder" />
          <span className="text-sm text-black/70 dark:text-white/70">
            Platform built by experienced gig workers who understand your needs
          </span>
        </motion.div>

        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FeatureBadge type="fees" />
          <span className="text-sm text-black/70 dark:text-white/70">
            Only 5% platform fee compared to 20-30% on other platforms
          </span>
        </motion.div>
      </div>
    </div>
  )
}
