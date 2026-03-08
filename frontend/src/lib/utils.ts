import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatScore(score: number | null | undefined): string {
    if (score === null || score === undefined) return '—';
    return score.toFixed(1);
}

export function getTierColor(tier: string | null | undefined): string {
    switch (tier) {
        case 'Hot': return 'text-red-500 bg-red-500/10 border-red-500/30';
        case 'Warm': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
        case 'Cold': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
        default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
}

export function getTierEmoji(tier: string | null | undefined): string {
    switch (tier) {
        case 'Hot': return '🔥';
        case 'Warm': return '🌡️';
        case 'Cold': return '❄️';
        default: return '➖';
    }
}

export function getScoreColor(score: number | null | undefined): string {
    if (!score) return 'text-gray-400';
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-blue-400';
}

export function timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
}
