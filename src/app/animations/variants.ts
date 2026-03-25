import type { Transition, Variants } from "motion/react";

export const easings = {
  standard: [0.4, 0, 0.2, 1],
  smooth: [0.22, 1, 0.36, 1],
  emphasized: [0.16, 1, 0.3, 1],
  exit: [0.4, 0, 1, 1],
} as const;

export const transitionDefaults: Transition = {
  duration: 0.42,
  ease: easings.smooth,
};

export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easings.emphasized,
      when: "beforeChildren",
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.24,
      ease: easings.exit,
    },
  },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.52,
      ease: easings.emphasized,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: easings.smooth,
    },
  },
};

export const createStagger = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});

export const sidebarLabelVariants: Variants = {
  expanded: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.28,
      ease: easings.standard,
    },
  },
  collapsed: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.2,
      ease: easings.standard,
    },
  },
};

export const hoverLift = {
  y: -6,
  scale: 1.02,
  transition: {
    duration: 0.28,
    ease: easings.standard,
  },
};

export const buttonHover = {
  scale: 1.03,
  y: -1,
  transition: {
    duration: 0.2,
    ease: easings.standard,
  },
};

export const buttonTap = {
  scale: 0.98,
  transition: {
    duration: 0.14,
    ease: easings.standard,
  },
};

