import React from 'react';
import { formatINR } from '../../lib/money.js';

export function PrintableDocument({ plan }) {
  if (!plan) return null;

  const { event, budget, timeline, vendors, ideas, risks } = plan;
  const perGuest = event?.guestCount && event?.totalBudget ? Math.round(event.totalBudget / event.guestCount) : 0;

  // Group timeline tasks by phase
  const tasksByPhase = (timeline || []).reduce((acc, task) => {
    const phase = task.phase || 'General';
    if (!acc[phase]) acc[phase] = [];
    acc[phase].push(task);
    return acc;
  }, {});

  return (
    <div className="hidden print:block text-black bg-white p-8 max-w-[210mm] mx-auto text-sm leading-relaxed">
      {/* Document Header */}
      <div className="border-b-2 border-stone-800 pb-6 mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-black tracking-tight text-stone-900 uppercase">Evenavi</span>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest">• Organise events</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight mt-2">{event.title}</h1>
          <p className="text-xs text-stone-600 mt-1">Official Event Planning Dossier & Operational Blueprint</p>
        </div>
        <div className="text-right text-xs text-stone-500">
          <div>Generated on: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          <div className="font-mono text-[10px] mt-0.5">Plan ID: {plan.id || 'N/A'}</div>
        </div>
      </div>

      {/* Event Meta Grid */}
      <div className="grid grid-cols-4 gap-4 p-4 rounded-xl border border-stone-300 bg-stone-50 mb-8 break-inside-avoid">
        <div>
          <div className="text-[10px] font-bold text-stone-500 uppercase">Event Type</div>
          <div className="text-xs font-bold text-stone-900 capitalize mt-0.5">{event.type}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-stone-500 uppercase">Target Date</div>
          <div className="text-xs font-bold text-stone-900 mt-0.5">{event.date}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-stone-500 uppercase">Location</div>
          <div className="text-xs font-bold text-stone-900 mt-0.5">{event.city} (Tier {event.cityTier || 2})</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-stone-500 uppercase">Guest Count</div>
          <div className="text-xs font-bold text-stone-900 mt-0.5">{event.guestCount} Guests</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-stone-500 uppercase">Total Budget</div>
          <div className="text-xs font-black text-stone-900 mt-0.5">{formatINR(event.totalBudget)}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-stone-500 uppercase">Per-Guest Target</div>
          <div className="text-xs font-bold text-stone-900 mt-0.5">{formatINR(perGuest)} / guest</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-stone-500 uppercase">Dietary Focus</div>
          <div className="text-xs font-bold text-stone-900 capitalize mt-0.5">{event.diet || 'Standard'}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-stone-500 uppercase">Venue Preference</div>
          <div className="text-xs font-bold text-stone-900 capitalize mt-0.5">{event.venueType || 'Indoor'}</div>
        </div>
      </div>

      {/* Executive Summary */}
      {(budget?.summary || budget?.perGuestInsight) && (
        <div className="mb-8 p-4 rounded-xl border border-stone-200 bg-white break-inside-avoid">
          <h2 className="text-xs font-black uppercase tracking-wider text-stone-900 mb-2 border-b border-stone-100 pb-1">
            Executive Strategy & Planning Summary
          </h2>
          {budget.summary && <p className="text-xs text-stone-700 leading-relaxed mb-2">{budget.summary}</p>}
          {budget.perGuestInsight && (
            <p className="text-xs text-stone-600 italic border-l-2 border-stone-400 pl-3 py-0.5">
              💡 {budget.perGuestInsight}
            </p>
          )}
        </div>
      )}

      {/* Section 1: Budget Breakdown */}
      <div className="mb-8 break-inside-avoid">
        <h2 className="text-sm font-black uppercase tracking-wider text-stone-900 mb-3 flex items-center justify-between border-b border-stone-300 pb-1">
          <span>1. Deterministic Budget Breakdown</span>
          <span className="text-xs font-normal text-stone-500">Total: {formatINR(event.totalBudget)}</span>
        </h2>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-300 bg-stone-100">
              <th className="py-2 px-3 font-bold text-stone-700">Category</th>
              <th className="py-2 px-3 font-bold text-stone-700 text-center">Share</th>
              <th className="py-2 px-3 font-bold text-stone-700 text-right">Planned Allocation</th>
              <th className="py-2 px-3 font-bold text-stone-700">Planning Notes & Guidance</th>
            </tr>
          </thead>
          <tbody>
            {(budget?.allocations || []).map((cat) => (
              <tr key={cat.id || cat.category} className="border-b border-stone-200">
                <td className="py-2 px-3 font-semibold text-stone-900">{cat.category}</td>
                <td className="py-2 px-3 text-center text-stone-600 font-mono">{cat.percent}%</td>
                <td className="py-2 px-3 text-right font-bold text-stone-900 font-mono">{formatINR(cat.planned)}</td>
                <td className="py-2 px-3 text-stone-600 text-[11px]">{cat.note || 'Allocated per regional tier'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-stone-800 bg-stone-50 font-bold">
              <td className="py-2 px-3 text-stone-900">Total</td>
              <td className="py-2 px-3 text-center font-mono">100%</td>
              <td className="py-2 px-3 text-right font-mono text-stone-900">{formatINR(event.totalBudget)}</td>
              <td className="py-2 px-3 text-stone-500 text-[11px]">Includes 3% emergency contingency floor</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Section 2: Complete Timeline Schedule */}
      <div className="mb-8 break-inside-avoid">
        <h2 className="text-sm font-black uppercase tracking-wider text-stone-900 mb-3 border-b border-stone-300 pb-1">
          2. Master Timeline & Execution Schedule
        </h2>
        <div className="space-y-4">
          {Object.entries(tasksByPhase).map(([phase, tasks]) => (
            <div key={phase} className="break-inside-avoid">
              <h3 className="text-xs font-black text-stone-800 bg-stone-100 px-3 py-1 rounded mb-2 border-l-4 border-stone-800">
                {phase}
              </h3>
              <table className="w-full text-left text-xs mb-3">
                <thead>
                  <tr className="text-[10px] font-bold text-stone-500 uppercase border-b border-stone-200">
                    <th className="py-1 px-3">Milestone Task</th>
                    <th className="py-1 px-3">Category</th>
                    <th className="py-1 px-3 text-center">Priority</th>
                    <th className="py-1 px-3 text-right">Target Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-b border-stone-100">
                      <td className="py-1.5 px-3 text-stone-800">
                        <span className="font-medium">{task.title}</span>
                      </td>
                      <td className="py-1.5 px-3 text-stone-500 text-[11px]">{task.category}</td>
                      <td className="py-1.5 px-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          task.priority === 'must'
                            ? 'bg-rose-100 text-rose-800'
                            : task.priority === 'should'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-semibold text-stone-700">{task.dueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Vendor Operations & Checklists */}
      {vendors && vendors.length > 0 && (
        <div className="mb-8 break-inside-avoid">
          <h2 className="text-sm font-black uppercase tracking-wider text-stone-900 mb-3 border-b border-stone-300 pb-1">
            3. Vendor Checklists & Negotiation Guidance
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {vendors.map((v) => (
              <div key={v.id || v.category} className="p-3 rounded-lg border border-stone-200 bg-stone-50/50 break-inside-avoid">
                <div className="flex justify-between items-center mb-1.5">
                  <h4 className="text-xs font-bold text-stone-900">{v.category}</h4>
                  <span className="text-[10px] font-mono capitalize px-2 py-0.5 bg-stone-200 text-stone-700 rounded">
                    Status: {v.status ? v.status.replace('_', ' ') : 'Not Started'}
                  </span>
                </div>
                {v.questions && v.questions.length > 0 && (
                  <div className="mt-2">
                    <div className="text-[10px] font-bold text-stone-600 uppercase">Key Questions to Ask:</div>
                    <ul className="list-disc list-inside text-[11px] text-stone-600 mt-0.5 space-y-0.5">
                      {v.questions.slice(0, 3).map((q, idx) => (
                        <li key={idx} className="leading-tight">{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {v.redFlags && v.redFlags.length > 0 && (
                  <div className="mt-2">
                    <div className="text-[10px] font-bold text-rose-700 uppercase">Red Flags to Watch:</div>
                    <ul className="list-disc list-inside text-[11px] text-rose-800 mt-0.5 space-y-0.5">
                      {v.redFlags.slice(0, 2).map((rf, idx) => (
                        <li key={idx} className="leading-tight">{rf}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Themes, Ideas & Multilingual Invitations */}
      {ideas && (
        <div className="mb-8 break-inside-avoid">
          <h2 className="text-sm font-black uppercase tracking-wider text-stone-900 mb-3 border-b border-stone-300 pb-1">
            4. Theme Concepts, Menu & Invitations
          </h2>

          {/* Theme concepts */}
          {ideas.themes && ideas.themes.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {ideas.themes.map((theme, i) => (
                <div key={i} className="p-3 rounded-lg border border-stone-200 break-inside-avoid">
                  <h4 className="text-xs font-bold text-stone-900">{theme.name}</h4>
                  <p className="text-[10px] text-stone-500 italic mb-2">{theme.tagline}</p>
                  <div className="flex gap-1 mb-2">
                    {theme.palette?.map((hex, pi) => (
                      <div key={pi} className="flex-1 h-3 rounded" style={{ backgroundColor: hex }} title={hex} />
                    ))}
                  </div>
                  <div className="text-[10px] text-stone-600">
                    <strong>Decor:</strong> {theme.decor?.slice(0, 2).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Invitation Copy */}
          {ideas.invitation && (
            <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-lg border border-stone-200 bg-stone-50 break-inside-avoid">
              <div>
                <div className="text-[10px] font-bold text-stone-500 uppercase mb-1">Invitation (English)</div>
                <p className="text-[11px] text-stone-700 italic leading-relaxed whitespace-pre-line">
                  "{ideas.invitation.en}"
                </p>
              </div>
              <div>
                <div className="text-[10px] font-bold text-stone-500 uppercase mb-1">Invitation (Hinglish)</div>
                <p className="text-[11px] text-stone-700 italic leading-relaxed whitespace-pre-line">
                  "{ideas.invitation.hinglish || ideas.invitation.hi}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section 5: Risk Audit & Contingency Protocols */}
      {risks && risks.length > 0 && (
        <div className="mb-8 break-inside-avoid">
          <h2 className="text-sm font-black uppercase tracking-wider text-stone-900 mb-3 border-b border-stone-300 pb-1">
            5. Plan B — Risk Contingency Protocols
          </h2>
          <div className="space-y-2">
            {risks.map((r) => (
              <div key={r.id} className="p-2.5 rounded-lg border border-stone-200 bg-stone-50 flex items-start justify-between gap-4 break-inside-avoid">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                      r.severity === 'high'
                        ? 'bg-rose-100 text-rose-800'
                        : r.severity === 'medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {r.severity} Risk
                    </span>
                    <span className="text-xs font-bold text-stone-900">{r.title}</span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-1">{r.detail}</p>
                </div>
                {r.mitigation && (
                  <div className="w-1/2 p-2 rounded bg-white border border-stone-200 text-[11px] text-stone-700">
                    <strong className="text-[10px] text-stone-500 uppercase block mb-0.5">Mitigation Action:</strong>
                    {r.mitigation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Footer */}
      <div className="border-t border-stone-300 pt-4 mt-8 flex justify-between items-center text-[10px] text-stone-500">
        <div>Evenavi • GenAI Event Planning Platform • Organise events</div>
        <div>Confidential & Proprietary • For Personal & Family Review Only</div>
      </div>
    </div>
  );
}
