'use client';

import type { Profile } from '@/types/database.types';
import { Target, Globe, Lock, Users, Sparkles } from 'lucide-react';

interface StudentSocialBadgeProps {
  profile: Profile;
  viewerRole?: 'teacher' | 'student';
}

export function StudentSocialBadge({ profile, viewerRole = 'teacher' }: StudentSocialBadgeProps) {
  const stats = profile.exam_stats;
  const privacy = profile.privacy_settings?.stats_visibility || 'public';

  const canViewStats =
    viewerRole === 'teacher' ||
    privacy === 'public' ||
    privacy === 'followers_only';

  const target = stats?.weekly_question_target || 750;
  const solved = stats?.weekly_questions_solved || 540;
  const percentage = Math.min(100, Math.round((solved / target) * 100));

  return (
    <div className="space-y-2 mt-2 pt-2 border-t border-slate-700/60">
      {/* Username & Bio */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono font-bold text-indigo-400">
          @{profile.username || `user_${profile.id.slice(0, 6)}`}
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono flex items-center gap-1">
          {privacy === 'public' && <Globe className="w-2.5 h-2.5 text-emerald-400" />}
          {privacy === 'followers_only' && <Users className="w-2.5 h-2.5 text-blue-400" />}
          {privacy === 'only_me_and_teacher' && <Lock className="w-2.5 h-2.5 text-amber-400" />}
          {privacy === 'public' ? 'Açık' : privacy === 'followers_only' ? 'Takipçi' : 'Özel'}
        </span>
      </div>

      {profile.bio && (
        <p className="text-[11px] text-slate-300 italic line-clamp-1">
          &ldquo;{profile.bio}&rdquo;
        </p>
      )}

      {/* Net & Target Stats */}
      {canViewStats && stats && (
        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">
              TYT: <strong className="text-white font-mono">{stats.tyt_net ?? '-'} Net</strong>
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">
              AYT: <strong className="text-emerald-400 font-mono">{stats.ayt_net ?? '-'} Net</strong>
            </span>
            {stats.latest_trial_rank && (
              <>
                <span className="text-slate-700">•</span>
                <span className="text-indigo-300 font-mono font-semibold">
                  Sıra: {stats.latest_trial_rank}
                </span>
              </>
            )}
          </div>

          {/* Soru Hedefi İlerleme Çubuğu */}
          <div>
            <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5">
              <span>Haftalık Soru Hedefi</span>
              <span className="font-mono text-white font-semibold">
                {solved}/{target} (%{percentage})
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
