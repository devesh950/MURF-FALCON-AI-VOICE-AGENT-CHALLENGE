'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Order {
  drinkType?: string;
  size?: string;
  milk?: string;
  extras?: string[];
  name?: string;
}

interface CoffeeVisualizerProps {
  messages?: any[];
  className?: string;
}

export function CoffeeVisualizer({ messages = [], className }: CoffeeVisualizerProps) {
  const [currentOrder, setCurrentOrder] = useState<Order>({});

  useEffect(() => {
    // Parse messages to extract order information
    const agentMessages = messages
      .filter((msg) => !msg.from?.isLocal)
      .map((msg) => msg.message.toLowerCase());

    const newOrder: Order = {};

    // Extract drink type
    const drinkTypes = ['cappuccino', 'latte', 'espresso', 'americano', 'macchiato', 'mocha', 'flat white', 'cold brew'];
    for (const drink of drinkTypes) {
      if (agentMessages.some((msg) => msg.includes(drink))) {
        newOrder.drinkType = drink.charAt(0).toUpperCase() + drink.slice(1);
        break;
      }
    }

    // Extract size
    if (agentMessages.some((msg) => msg.includes('small') || msg.includes('tall'))) {
      newOrder.size = 'small';
    } else if (agentMessages.some((msg) => msg.includes('medium') || msg.includes('grande'))) {
      newOrder.size = 'medium';
    } else if (agentMessages.some((msg) => msg.includes('large') || msg.includes('venti'))) {
      newOrder.size = 'large';
    }

    // Extract milk
    const milkTypes = ['oat milk', 'almond milk', 'soy milk', 'whole milk', 'skim milk', '2% milk'];
    for (const milk of milkTypes) {
      if (agentMessages.some((msg) => msg.includes(milk))) {
        newOrder.milk = milk;
        break;
      }
    }

    // Extract extras
    const extras: string[] = [];
    const possibleExtras = ['whipped cream', 'vanilla', 'caramel', 'hazelnut', 'extra shot', 'cinnamon', 'chocolate'];
    for (const extra of possibleExtras) {
      if (agentMessages.some((msg) => msg.includes(extra))) {
        extras.push(extra);
      }
    }
    if (extras.length > 0) {
      newOrder.extras = extras;
    }

    // Extract name
    const nameMatch = agentMessages.find((msg) => msg.includes('name is') || msg.includes("name's"));
    if (nameMatch) {
      const nameRegex = /name(?:'s| is)\s+(\w+)/i;
      const match = nameMatch.match(nameRegex);
      if (match) {
        newOrder.name = match[1].charAt(0).toUpperCase() + match[1].slice(1);
      }
    }

    setCurrentOrder(newOrder);
  }, [messages]);

  const getCupSize = () => {
    switch (currentOrder.size) {
      case 'small':
        return { height: 'h-32', width: 'w-20' };
      case 'medium':
        return { height: 'h-40', width: 'w-24' };
      case 'large':
        return { height: 'h-48', width: 'w-28' };
      default:
        return { height: 'h-40', width: 'w-24' };
    }
  };

  const cupSize = getCupSize();
  const hasWhippedCream = currentOrder.extras?.some((e) => e.toLowerCase().includes('whipped cream'));
  const hasOrder = Object.keys(currentOrder).length > 0;

  return (
    <div className={cn('flex flex-col items-center justify-center gap-6 p-6', className)}>
      {/* Coffee Cup Visualization */}
      {hasOrder && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative flex flex-col items-center mb-4"
        >
          {/* Whipped Cream */}
          {hasWhippedCream && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="absolute -top-6 z-10"
            >
              <div className="h-8 w-16 rounded-full bg-gradient-to-b from-white to-stone-100 shadow-lg" />
              <div className="absolute top-2 left-1/2 h-6 w-12 -translate-x-1/2 rounded-full bg-gradient-to-b from-stone-50 to-stone-200" />
            </motion.div>
          )}

          {/* Coffee Cup */}
          <div className="relative flex flex-col items-center">
            {/* Cup Body */}
            <div
              className={cn(
                'relative rounded-lg bg-gradient-to-b from-emerald-700 to-emerald-900 shadow-2xl',
                cupSize.height,
                cupSize.width
              )}
            >
              {/* Starbucks Logo Area */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-emerald-800">
                    <circle cx="12" cy="12" r="10" fill="currentColor" />
                    <path
                      d="M12 8c-2 0-3 1-3 2s1 1.5 3 1.5 3-.5 3-1.5-1-2-3-2z"
                      fill="white"
                    />
                    <path
                      d="M8 14c0 2 1.5 3.5 4 3.5s4-1.5 4-3.5"
                      stroke="white"
                      strokeWidth="0.8"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>

              {/* Cup Lid */}
              <div className={cn('absolute -top-2 left-1/2 h-3 -translate-x-1/2 rounded-t-lg bg-white shadow-md', cupSize.width)} />
            </div>

            {/* Cup Holder */}
            <div className={cn('h-2 rounded-b-md bg-emerald-950', cupSize.width, 'w-[90%]')} />
          </div>

          {/* Steam Effect */}
          <motion.div
            className="absolute -top-12 flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="h-8 w-1 rounded-full bg-gray-300"
                animate={{ y: [-5, -15], opacity: [0.6, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Order Receipt */}
      {hasOrder && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full max-w-sm rounded-xl border-2 border-emerald-600 bg-white dark:bg-gray-800 p-6 shadow-2xl"
        >
          {/* Receipt Header */}
          <div className="border-b-2 border-dashed border-emerald-300 dark:border-emerald-600 pb-4 mb-4 text-center">
            <h3 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-1">
              ☕ Starbucks Order
            </h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Powered by Murf AI Falcon 🚀</p>
          </div>

          {/* Order Details */}
          <div className="space-y-3">
            {currentOrder.name && (
              <div className="flex justify-between items-center py-2 border-b border-emerald-200 dark:border-emerald-700">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Customer:</span>
                <span className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{currentOrder.name}</span>
              </div>
            )}

            {currentOrder.drinkType && (
              <div className="flex justify-between items-center py-2 border-b border-emerald-200 dark:border-emerald-700">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Drink:</span>
                <span className="font-medium text-emerald-900 dark:text-emerald-100">{currentOrder.drinkType}</span>
              </div>
            )}

            {currentOrder.size && (
              <div className="flex justify-between items-center py-2 border-b border-emerald-200 dark:border-emerald-700">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Size:</span>
                <span className="font-medium text-emerald-900 dark:text-emerald-100 capitalize">{currentOrder.size}</span>
              </div>
            )}

            {currentOrder.milk && (
              <div className="flex justify-between items-center py-2 border-b border-emerald-200 dark:border-emerald-700">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Milk:</span>
                <span className="font-medium text-emerald-900 dark:text-emerald-100">{currentOrder.milk}</span>
              </div>
            )}

            {currentOrder.extras && currentOrder.extras.length > 0 && (
              <div className="py-2 border-b border-emerald-200 dark:border-emerald-700">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300 block mb-2">Extras:</span>
                <div className="flex flex-wrap gap-2">
                  {currentOrder.extras.map((extra, idx) => (
                    <span
                      key={idx}
                      className="inline-block rounded-full bg-emerald-200 dark:bg-emerald-700 px-3 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-100"
                    >
                      + {extra}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Receipt Footer */}
          <div className="mt-6 pt-4 border-t-2 border-dashed border-emerald-300 dark:border-emerald-600 text-center">
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">
              ⏳ Order in progress...
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
              #MurfAIVoiceAgentsChallenge
            </p>
          </div>
        </motion.div>
      )}

      {/* Empty State - Always show when no order */}
      {!hasOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-3xl p-8 shadow-2xl border-2 border-emerald-300 dark:border-emerald-600"
        >
          <div className="mb-4 text-7xl animate-bounce">☕</div>
          <p className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">
            🎤 Start Your Order!
          </p>
          <p className="text-base text-emerald-700 dark:text-emerald-300 font-medium">
            Tell me what you'd like to drink...
          </p>
          <div className="mt-4 text-sm text-emerald-600 dark:text-emerald-400 space-y-1">
            <p>🗣️ Just speak naturally</p>
            <p>📋 I'll build your order live</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
