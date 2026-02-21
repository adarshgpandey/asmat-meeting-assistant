<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Asmat — AI Meeting Assistant</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Mono:ital,wght@0,300;1,300&display=swap" rel="stylesheet">
<style>
  :root {
    --ink: #0a0a0f;
    --paper: #f5f2eb;
    --cream: #ede9df;
    --accent: #c8ff57;
    --accent2: #57c8ff;
    --muted: #888880;
    --card: rgba(255,255,255,0.04);
    --border: rgba(255,255,255,0.08);
  }

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  html { scroll-behavior: smooth; }

  body {
    background: var(--ink);
    color: #e8e5de;
    font-family: 'Sora', sans-serif;
    overflow-x: hidden;
    cursor: none;
  }

  /* Custom cursor */
  .cursor {
    position: fixed;
    width: 12px; height: 12px;
    background: var(--accent);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%,-50%);
    transition: transform 0.1s, width 0.3s, height 0.3s, background 0.3s;
    mix-blend-mode: difference;
  }
  .cursor-ring {
    position: fixed;
    width: 40px; height: 40px;
    border: 1px solid rgba(200,255,87,0.4);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    transform: translate(-50%,-50%);
    transition: transform 0.15s ease-out, width 0.3s, height 0.3s;
  }
  body:hover .cursor { opacity: 1; }

  /* Grain overlay */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9997;
    opacity: 0.4;
  }

  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 100;
    padding: 24px 60px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid transparent;
    transition: border-color 0.3s, backdrop-filter 0.3s, background 0.3s;
  }
  nav.scrolled {
    border-color: var(--border);
    backdrop-filter: blur(20px);
    background: rgba(10,10,15,0.7);
  }
  .nav-logo {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.5px;
    display: flex; align-items: center; gap: 10px;
  }
  .logo-dot {
    width: 8px; height: 8px;
    background: var(--accent);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }
  .nav-links {
    display: flex; gap: 40px;
    list-style: none;
  }
  .nav-links a {
    color: var(--muted);
    text-decoration: none;
    font-size: 14px;
    letter-spacing: 0.02em;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: #e8e5de; }
  .nav-cta {
    background: var(--accent);
    color: var(--ink);
    border: none;
    padding: 10px 24px;
    border-radius: 100px;
    font-family: 'Sora', sans-serif;
    font-weight: 600;
    font-size: 14px;
    cursor: none;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .nav-cta:hover {
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(200,255,87,0.3);
  }

  /* HERO */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center;
    padding: 120px 40px 80px;
    position: relative;
    overflow: hidden;
  }

  /* Animated background orbs */
  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
    animation: drift 12s ease-in-out infinite;
  }
  .orb-1 {
    width: 600px; height: 600px;
    background: radial-gradient(circle, #c8ff57, transparent 70%);
    top: -200px; left: -100px;
    animation-delay: 0s;
  }
  .orb-2 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, #57c8ff, transparent 70%);
    bottom: -150px; right: -100px;
    animation-delay: -4s;
  }
  .orb-3 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, #ff57a8, transparent 70%);
    top: 40%; left: 60%;
    animation-delay: -8s;
  }
  @keyframes drift {
    0%, 100% { transform: translate(0,0) scale(1); }
    33% { transform: translate(30px,-40px) scale(1.05); }
    66% { transform: translate(-20px,20px) scale(0.95); }
  }

  /* Grid lines */
  .grid-overlay {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 80px 80px;
    pointer-events: none;
  }

  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    border: 1px solid var(--border);
    background: rgba(200,255,87,0.06);
    padding: 6px 16px;
    border-radius: 100px;
    font-size: 12px;
    font-family: 'DM Mono', monospace;
    color: var(--accent);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 40px;
    opacity: 0;
    animation: fadeUp 0.8s 0.2s forwards;
  }
  .badge-blink {
    width: 6px; height: 6px;
    background: var(--accent);
    border-radius: 50%;
    animation: blink 1s infinite;
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .hero-title {
    font-size: clamp(56px, 8vw, 120px);
    font-weight: 800;
    line-height: 0.95;
    letter-spacing: -0.04em;
    max-width: 900px;
    opacity: 0;
    animation: fadeUp 0.8s 0.4s forwards;
  }
  .hero-title em {
    font-style: normal;
    color: transparent;
    -webkit-text-stroke: 1px rgba(200,255,87,0.6);
    position: relative;
  }
  .hero-sub {
    font-size: 18px;
    color: var(--muted);
    max-width: 500px;
    line-height: 1.7;
    margin-top: 32px;
    font-weight: 300;
    opacity: 0;
    animation: fadeUp 0.8s 0.6s forwards;
  }
  .hero-actions {
    display: flex; gap: 16px; align-items: center;
    margin-top: 48px;
    opacity: 0;
    animation: fadeUp 0.8s 0.8s forwards;
  }
  .btn-primary {
    background: var(--accent);
    color: var(--ink);
    border: none;
    padding: 16px 36px;
    border-radius: 100px;
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 15px;
    cursor: none;
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
  }
  .btn-primary::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%);
    border-radius: 100px;
  }
  .btn-primary:hover {
    transform: scale(1.05) translateY(-2px);
    box-shadow: 0 20px 60px rgba(200,255,87,0.4);
  }
  .btn-ghost {
    color: var(--muted);
    font-size: 14px;
    display: flex; align-items: center; gap: 8px;
    transition: color 0.2s;
    cursor: none;
  }
  .btn-ghost:hover { color: #e8e5de; }
  .btn-ghost span {
    width: 36px; height: 36px;
    border: 1px solid var(--border);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px;
    transition: border-color 0.2s;
  }
  .btn-ghost:hover span { border-color: rgba(255,255,255,0.3); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* DASHBOARD MOCKUP */
  .hero-mockup {
    margin-top: 80px;
    width: 100%;
    max-width: 1000px;
    opacity: 0;
    animation: fadeUp 1s 1s forwards;
    position: relative;
  }
  .mockup-frame {
    background: rgba(20,20,28,0.9);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);
    backdrop-filter: blur(20px);
  }
  .mockup-bar {
    background: rgba(255,255,255,0.03);
    border-bottom: 1px solid var(--border);
    padding: 14px 20px;
    display: flex; align-items: center; gap: 12px;
  }
  .dots { display: flex; gap: 6px; }
  .dot { width: 10px; height: 10px; border-radius: 50%; }
  .dot-r { background: #ff5f57; }
  .dot-y { background: #ffbd2e; }
  .dot-g { background: #28c941; }
  .mockup-title-bar {
    flex: 1; text-align: center;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.05em;
  }

  .mockup-body {
    display: grid; grid-template-columns: 220px 1fr 280px;
    height: 460px;
  }

  /* Sidebar */
  .sidebar {
    border-right: 1px solid var(--border);
    padding: 24px 16px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .sidebar-item {
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 13px;
    color: var(--muted);
    display: flex; align-items: center; gap: 10px;
    cursor: none;
    transition: background 0.2s, color 0.2s;
  }
  .sidebar-item.active {
    background: rgba(200,255,87,0.1);
    color: var(--accent);
  }
  .sidebar-item:hover:not(.active) { background: rgba(255,255,255,0.04); color: #e8e5de; }
  .sidebar-icon { font-size: 15px; }
  .sidebar-label { font-size: 12px; }

  /* Main area */
  .main-area {
    padding: 28px;
    overflow: hidden;
    position: relative;
  }
  .meeting-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 24px;
  }
  .meeting-title { font-size: 17px; font-weight: 600; letter-spacing: -0.02em; }
  .meeting-sub { font-size: 12px; color: var(--muted); margin-top: 3px; font-family: 'DM Mono', monospace; }
  .rec-badge {
    display: flex; align-items: center; gap: 6px;
    background: rgba(255,87,87,0.15);
    border: 1px solid rgba(255,87,87,0.2);
    padding: 5px 12px; border-radius: 100px;
    font-size: 11px; color: #ff7070;
    font-family: 'DM Mono', monospace;
  }
  .rec-dot { width: 6px; height: 6px; background: #ff5757; border-radius: 50%; animation: blink 1s infinite; }

  /* Waveform */
  .waveform {
    display: flex; align-items: center; gap: 3px;
    height: 60px; margin-bottom: 24px;
    padding: 0 4px;
  }
  .wave-bar {
    flex: 1;
    background: rgba(200,255,87,0.3);
    border-radius: 2px;
    animation: wave 0.8s ease-in-out infinite alternate;
  }
  @keyframes wave {
    from { height: 4px; opacity: 0.3; }
    to { height: var(--h); opacity: 0.8; }
  }

  /* Transcript */
  .transcript { display: flex; flex-direction: column; gap: 14px; }
  .transcript-line { display: flex; gap: 12px; align-items: flex-start; }
  .speaker-avatar {
    width: 28px; height: 28px;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .av-a { background: rgba(200,255,87,0.2); color: var(--accent); }
  .av-b { background: rgba(87,200,255,0.2); color: var(--accent2); }
  .av-c { background: rgba(255,87,168,0.2); color: #ff57a8; }
  .transcript-text { font-size: 12px; color: #c8c5be; line-height: 1.6; }
  .transcript-name { font-size: 10px; color: var(--muted); margin-bottom: 3px; font-family: 'DM Mono', monospace; }

  /* Typing indicator */
  .typing { display: flex; gap: 4px; align-items: center; margin-top: 4px; }
  .typing span {
    width: 5px; height: 5px;
    background: var(--accent);
    border-radius: 50%;
    animation: typing 1.2s infinite;
  }
  .typing span:nth-child(2) { animation-delay: 0.2s; }
  .typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typing {
    0%, 60%, 100% { opacity: 0.2; transform: scale(0.8); }
    30% { opacity: 1; transform: scale(1); }
  }

  /* Right panel */
  .right-panel {
    border-left: 1px solid var(--border);
    padding: 24px 20px;
    display: flex; flex-direction: column; gap: 20px;
    overflow: hidden;
  }
  .panel-section-title {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    margin-bottom: 12px;
  }
  .score-ring {
    display: flex; align-items: center; gap: 16px;
    margin-bottom: 16px;
  }
  .ring-svg { position: relative; }
  .ring-label {
    font-size: 11px; color: var(--muted);
  }
  .ring-score { font-size: 22px; font-weight: 700; color: var(--accent); }
  .ring-category { font-size: 10px; font-family: 'DM Mono', monospace; color: var(--muted); }

  .metric-row {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 10px;
  }
  .metric-name { font-size: 11px; color: var(--muted); }
  .metric-bar-wrap { flex: 1; margin: 0 12px; height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
  .metric-bar {
    height: 100%;
    border-radius: 2px;
    animation: barFill 2s ease-out forwards;
    transform-origin: left;
  }
  @keyframes barFill {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
  .metric-val { font-size: 11px; font-family: 'DM Mono', monospace; }

  .notes-area {
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px;
    flex: 1;
    overflow: hidden;
  }
  .note-item {
    font-size: 11px; color: #c8c5be;
    padding: 6px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    display: flex; gap: 8px; align-items: flex-start;
    line-height: 1.5;
  }
  .note-item:last-child { border-bottom: none; }
  .note-icon { color: var(--accent); flex-shrink: 0; font-size: 10px; margin-top: 2px; }

  /* SECTION COMMON */
  section {
    padding: 140px 60px;
    position: relative;
  }
  .section-tag {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 20px;
    display: flex; align-items: center; gap: 12px;
  }
  .section-tag::after {
    content: '';
    flex: 1; height: 1px;
    background: var(--border);
    max-width: 60px;
  }
  .section-title {
    font-size: clamp(40px, 5vw, 72px);
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1;
    max-width: 700px;
  }
  .section-body {
    font-size: 17px;
    color: var(--muted);
    max-width: 480px;
    line-height: 1.7;
    font-weight: 300;
    margin-top: 24px;
  }

  /* FEATURES */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
    margin-top: 80px;
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
  }
  .feature-card {
    background: rgba(255,255,255,0.02);
    padding: 40px 36px;
    border-right: 1px solid var(--border);
    transition: background 0.3s;
    position: relative;
    overflow: hidden;
  }
  .feature-card:last-child { border-right: none; }
  .feature-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(200,255,87,0.06) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .feature-card:hover { background: rgba(255,255,255,0.04); }
  .feature-card:hover::before { opacity: 1; }
  .feature-icon {
    font-size: 32px;
    margin-bottom: 24px;
    display: block;
  }
  .feature-name {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 12px;
  }
  .feature-desc {
    font-size: 14px;
    color: var(--muted);
    line-height: 1.7;
    font-weight: 300;
  }
  .feature-accent {
    display: inline-block;
    background: rgba(200,255,87,0.1);
    color: var(--accent);
    padding: 3px 10px;
    border-radius: 100px;
    font-size: 11px;
    font-family: 'DM Mono', monospace;
    margin-top: 20px;
    letter-spacing: 0.05em;
  }

  /* INTERVIEW BENCHMARK */
  .benchmark-section {
    background: rgba(255,255,255,0.015);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .benchmark-layout {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 80px; align-items: center;
    margin-top: 60px;
  }
  .benchmark-card {
    background: rgba(20,20,28,0.8);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 36px;
    position: relative;
    overflow: hidden;
  }
  .benchmark-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
  }

  .candidate-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid var(--border);
    position: relative;
  }
  .candidate-row:last-child { border-bottom: none; }
  .candidate-info { display: flex; align-items: center; gap: 12px; }
  .cand-avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700;
  }
  .cand-name { font-size: 13px; font-weight: 600; }
  .cand-role { font-size: 11px; color: var(--muted); font-family: 'DM Mono', monospace; }
  .score-pill {
    padding: 4px 14px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 700;
    font-family: 'DM Mono', monospace;
  }
  .score-high { background: rgba(200,255,87,0.15); color: var(--accent); }
  .score-med { background: rgba(87,200,255,0.15); color: var(--accent2); }
  .score-low { background: rgba(255,87,87,0.15); color: #ff7070; }

  .rank-badge {
    position: absolute;
    left: -8px;
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    color: var(--muted);
  }

  /* NOTES FEATURE */
  .notes-section { }
  .notes-layout {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 80px; align-items: center;
    margin-top: 60px;
  }
  .note-card-large {
    background: rgba(20,20,28,0.8);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 36px;
    position: relative;
  }
  .note-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 28px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
  }
  .note-title { font-size: 15px; font-weight: 600; }
  .note-time { font-size: 11px; font-family: 'DM Mono', monospace; color: var(--muted); }
  .note-entry {
    margin-bottom: 20px;
  }
  .note-entry-time { font-size: 10px; font-family: 'DM Mono', monospace; color: var(--accent); margin-bottom: 6px; }
  .note-entry-text { font-size: 13px; color: #c8c5be; line-height: 1.6; }
  .note-entry-tag {
    display: inline-block;
    margin-top: 8px;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-family: 'DM Mono', monospace;
  }
  .tag-action { background: rgba(200,255,87,0.1); color: var(--accent); }
  .tag-decision { background: rgba(87,200,255,0.1); color: var(--accent2); }
  .tag-question { background: rgba(255,87,168,0.1); color: #ff57a8; }

  /* HUMAN-LIKE */
  .human-section { }
  .human-grid {
    display: grid; grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    margin-top: 60px;
  }
  .human-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
    transition: border-color 0.3s, transform 0.3s;
    position: relative;
    overflow: hidden;
  }
  .human-card:hover {
    border-color: rgba(200,255,87,0.2);
    transform: translateY(-4px);
  }
  .human-card.wide {
    grid-column: span 2;
    display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center;
  }
  .hc-number {
    font-size: 80px;
    font-weight: 800;
    letter-spacing: -0.06em;
    color: transparent;
    -webkit-text-stroke: 1px rgba(200,255,87,0.2);
    line-height: 1;
    margin-bottom: 16px;
  }
  .hc-title { font-size: 22px; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.02em; }
  .hc-text { font-size: 14px; color: var(--muted); line-height: 1.7; font-weight: 300; }

  /* RESPONSE TIME ANIMATION */
  .response-demo {
    background: rgba(20,20,28,0.8);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
  }
  .chat-bubble {
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 13px;
    max-width: 80%;
    margin-bottom: 12px;
    line-height: 1.5;
    position: relative;
  }
  .bubble-user {
    background: rgba(200,255,87,0.1);
    border: 1px solid rgba(200,255,87,0.15);
    color: #e8e5de;
    margin-left: auto;
    border-bottom-right-radius: 4px;
  }
  .bubble-ai {
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    color: #c8c5be;
    border-bottom-left-radius: 4px;
  }
  .response-time {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: var(--accent);
    text-align: right;
    margin-bottom: 20px;
  }

  /* CTA */
  .cta-section {
    text-align: center;
    padding: 160px 60px;
    position: relative;
    overflow: hidden;
  }
  .cta-glow {
    position: absolute;
    width: 800px; height: 400px;
    background: radial-gradient(ellipse, rgba(200,255,87,0.08) 0%, transparent 70%);
    top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    pointer-events: none;
  }
  .cta-title {
    font-size: clamp(48px, 7vw, 100px);
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 0.95;
    max-width: 800px;
    margin: 0 auto 40px;
  }
  .cta-sub {
    font-size: 18px; color: var(--muted);
    font-weight: 300;
    margin-bottom: 48px;
  }

  /* FOOTER */
  footer {
    border-top: 1px solid var(--border);
    padding: 40px 60px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .footer-logo { font-size: 16px; font-weight: 700; letter-spacing: -0.02em; }
  .footer-copy { font-size: 12px; color: var(--muted); font-family: 'DM Mono', monospace; }

  /* Scroll animations */
  .reveal {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.8s ease, transform 0.8s ease;
  }
  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .reveal-delay-1 { transition-delay: 0.1s; }
  .reveal-delay-2 { transition-delay: 0.2s; }
  .reveal-delay-3 { transition-delay: 0.3s; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--ink); }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

  /* Responsive */
  @media (max-width: 768px) {
    nav { padding: 20px 24px; }
    .nav-links { display: none; }
    section { padding: 80px 24px; }
    .features-grid { grid-template-columns: 1fr; }
    .benchmark-layout, .notes-layout { grid-template-columns: 1fr; gap: 40px; }
    .human-grid { grid-template-columns: 1fr; }
    .human-card.wide { grid-column: span 1; grid-template-columns: 1fr; }
    .mockup-body { grid-template-columns: 1fr; }
    .sidebar, .right-panel { display: none; }
    footer { flex-direction: column; gap: 16px; text-align: center; }
  }
</style>
</head>
<body>

<div class="cursor" id="cursor"></div>
<div class="cursor-ring" id="cursorRing"></div>

<!-- NAV -->
<nav id="nav">
  <div class="nav-logo">
    <div class="logo-dot"></div>
    Asmat
  </div>
  <ul class="nav-links">
    <li><a href="#features">Features</a></li>
    <li><a href="#benchmark">Benchmark</a></li>
    <li><a href="#notes">Notes</a></li>
    <li><a href="#pricing">Pricing</a></li>
  </ul>
  <button class="nav-cta">Get early access</button>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>
  <div class="grid-overlay"></div>

  <div class="hero-badge">
    <div class="badge-blink"></div>
    Now in beta — limited access
  </div>

  <h1 class="hero-title">
    Meetings that<br>think for <em>you</em>
  </h1>
  <p class="hero-sub">
    Asmat listens, understands, and acts like a brilliant colleague who never misses a word.
  </p>

  <div class="hero-actions">
    <button class="btn-primary">Start free trial →</button>
    <div class="btn-ghost">
      <span>▶</span>
      Watch 2 min demo
    </div>
  </div>

  <!-- Mockup -->
  <div class="hero-mockup">
    <div class="mockup-frame">
      <div class="mockup-bar">
        <div class="dots">
          <div class="dot dot-r"></div>
          <div class="dot dot-y"></div>
          <div class="dot dot-g"></div>
        </div>
        <div class="mockup-title-bar">asmat.app — Product Strategy Q4</div>
        <div class="rec-badge">
          <div class="rec-dot"></div>
          REC 00:23:47
        </div>
      </div>

      <div class="mockup-body">
        <!-- Sidebar -->
        <div class="sidebar">
          <div class="sidebar-item active"><span class="sidebar-icon">◈</span><span class="sidebar-label">Live Session</span></div>
          <div class="sidebar-item"><span class="sidebar-icon">◎</span><span class="sidebar-label">Notes</span></div>
          <div class="sidebar-item"><span class="sidebar-icon">⬡</span><span class="sidebar-label">Benchmark</span></div>
          <div class="sidebar-item"><span class="sidebar-icon">◷</span><span class="sidebar-label">History</span></div>
          <div class="sidebar-item"><span class="sidebar-icon">◈</span><span class="sidebar-label">Reports</span></div>
        </div>

        <!-- Main -->
        <div class="main-area">
          <div class="meeting-header">
            <div>
              <div class="meeting-title">Product Strategy — Q4 2025</div>
              <div class="meeting-sub">5 participants · Started 23 min ago</div>
            </div>
          </div>

          <!-- Waveform -->
          <div class="waveform" id="waveform"></div>

          <!-- Transcript -->
          <div class="transcript">
            <div class="transcript-line">
              <div class="speaker-avatar av-a">JK</div>
              <div>
                <div class="transcript-name">Jordan Kim · Product Lead</div>
                <div class="transcript-text">We need to decide on the roadmap priority before end of month. The mobile features are lagging behind our competitors significantly.</div>
              </div>
            </div>
            <div class="transcript-line">
              <div class="speaker-avatar av-b">SR</div>
              <div>
                <div class="transcript-name">Sam Rivera · Engineering</div>
                <div class="transcript-text">I agree, but we have three sprints blocked waiting on design sign-off. Can we unblock those first?</div>
              </div>
            </div>
            <div class="transcript-line">
              <div class="speaker-avatar av-c">AL</div>
              <div>
                <div class="transcript-name">Asmat AI · Taking notes...</div>
                <div class="typing"><span></span><span></span><span></span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel -->
        <div class="right-panel">
          <div>
            <div class="panel-section-title">Interview Score</div>
            <div class="score-ring">
              <div>
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="4"/>
                  <circle cx="30" cy="30" r="24" fill="none" stroke="#c8ff57" stroke-width="4"
                    stroke-dasharray="150.8" stroke-dashoffset="30"
                    stroke-linecap="round" transform="rotate(-90 30 30)"
                    style="animation: ringFill 2s ease-out forwards;">
                    <animate attributeName="stroke-dashoffset" from="150.8" to="30" dur="2s" fill="freeze"/>
                  </circle>
                  <text x="30" y="35" text-anchor="middle" fill="#c8ff57" font-size="14" font-weight="700" font-family="Sora">87</text>
                </svg>
              </div>
              <div>
                <div class="ring-score">87/100</div>
                <div class="ring-category">Communication</div>
                <div class="ring-label" style="margin-top:4px">Strong performer</div>
              </div>
            </div>

            <div class="metric-row">
              <div class="metric-name">Clarity</div>
              <div class="metric-bar-wrap"><div class="metric-bar" style="width:88%;background:var(--accent);animation-delay:0.2s"></div></div>
              <div class="metric-val" style="color:var(--accent)">88%</div>
            </div>
            <div class="metric-row">
              <div class="metric-name">Depth</div>
              <div class="metric-bar-wrap"><div class="metric-bar" style="width:72%;background:var(--accent2);animation-delay:0.4s"></div></div>
              <div class="metric-val" style="color:var(--accent2)">72%</div>
            </div>
            <div class="metric-row">
              <div class="metric-name">Pace</div>
              <div class="metric-bar-wrap"><div class="metric-bar" style="width:91%;background:#c4a9ff;animation-delay:0.6s"></div></div>
              <div class="metric-val" style="color:#c4a9ff">91%</div>
            </div>
          </div>

          <div>
            <div class="panel-section-title">Smart Notes</div>
            <div class="notes-area">
              <div class="note-item">
                <div class="note-icon">→</div>
                <div>Mobile roadmap delay — 3 sprints blocked</div>
              </div>
              <div class="note-item">
                <div class="note-icon">◆</div>
                <div>Action: Design team sign-off needed by EOW</div>
              </div>
              <div class="note-item">
                <div class="note-icon">★</div>
                <div>Decision: Prioritize mobile Q4</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section id="features">
  <div class="section-tag">Core features</div>
  <h2 class="section-title reveal">Built for how humans actually meet.</h2>
  <p class="section-body reveal reveal-delay-1">Every feature designed around real meeting dynamics — not idealized ones.</p>

  <div class="features-grid reveal reveal-delay-2">
    <div class="feature-card">
      <span class="feature-icon">◎</span>
      <div class="feature-name">Instant Reaction</div>
      <div class="feature-desc">Responds in under 200ms. Asmat processes speech in real-time, surfacing insights before the conversation moves on.</div>
      <div class="feature-accent">< 200ms latency</div>
    </div>
    <div class="feature-card">
      <span class="feature-icon">✦</span>
      <div class="feature-name">Smart Notes</div>
      <div class="feature-desc">Automatically tags action items, decisions, and questions. Generates structured summaries the moment the meeting ends.</div>
      <div class="feature-accent">Auto-structured</div>
    </div>
    <div class="feature-card">
      <span class="feature-icon">⬡</span>
      <div class="feature-name">Interview Benchmark</div>
      <div class="feature-desc">Score candidates on clarity, depth, confidence, and relevance. Compare across sessions with objective analytics.</div>
      <div class="feature-accent">Multi-dimensional</div>
    </div>
  </div>
</section>

<!-- BENCHMARK -->
<section id="benchmark" class="benchmark-section">
  <div class="section-tag">Interview Intelligence</div>
  <div class="benchmark-layout">
    <div class="reveal">
      <h2 class="section-title">Rank every candidate. Instantly.</h2>
      <p class="section-body">Asmat benchmarks each interview response against your custom rubric and historical top performers. No more gut-feel hiring.</p>
      <div style="margin-top:32px;display:flex;gap:32px;">
        <div>
          <div style="font-size:36px;font-weight:800;color:var(--accent);letter-spacing:-0.04em">3.4×</div>
          <div style="font-size:13px;color:var(--muted);margin-top:4px">faster decisions</div>
        </div>
        <div>
          <div style="font-size:36px;font-weight:800;color:var(--accent2);letter-spacing:-0.04em">94%</div>
          <div style="font-size:13px;color:var(--muted);margin-top:4px">accuracy vs panel</div>
        </div>
      </div>
    </div>
    <div class="benchmark-card reveal reveal-delay-2">
      <div style="font-size:13px;font-weight:600;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;">
        <span>Senior Designer Role</span>
        <span style="font-size:10px;font-family:'DM Mono',monospace;color:var(--muted)">5 candidates</span>
      </div>
      <div class="candidate-row">
        <div class="candidate-info">
          <div class="cand-avatar" style="background:rgba(200,255,87,0.15);color:var(--accent)">AK</div>
          <div>
            <div class="cand-name">Aiko Nakamura</div>
            <div class="cand-role">UX / 6 yrs exp</div>
          </div>
        </div>
        <div class="score-pill score-high">92</div>
      </div>
      <div class="candidate-row">
        <div class="candidate-info">
          <div class="cand-avatar" style="background:rgba(87,200,255,0.15);color:var(--accent2)">DP</div>
          <div>
            <div class="cand-name">Diego Pereira</div>
            <div class="cand-role">Product / 4 yrs exp</div>
          </div>
        </div>
        <div class="score-pill score-high">87</div>
      </div>
      <div class="candidate-row">
        <div class="candidate-info">
          <div class="cand-avatar" style="background:rgba(196,169,255,0.15);color:#c4a9ff">MT</div>
          <div>
            <div class="cand-name">Maya Thompson</div>
            <div class="cand-role">Visual / 3 yrs exp</div>
          </div>
        </div>
        <div class="score-pill score-med">74</div>
      </div>
      <div class="candidate-row">
        <div class="candidate-info">
          <div class="cand-avatar" style="background:rgba(255,87,87,0.1);color:#ff7070">JL</div>
          <div>
            <div class="cand-name">James Liu</div>
            <div class="cand-role">UI / 2 yrs exp</div>
          </div>
        </div>
        <div class="score-pill score-low">61</div>
      </div>
    </div>
  </div>
</section>

<!-- NOTES -->
<section id="notes" class="notes-section">
  <div class="section-tag">AI Note-taking</div>
  <div class="notes-layout">
    <div class="note-card-large reveal">
      <div class="note-header">
        <div class="note-title">Q4 Strategy Session</div>
        <div class="note-time">Generated in 1.2s</div>
      </div>
      <div class="note-entry">
        <div class="note-entry-time">00:04:12</div>
        <div class="note-entry-text">Mobile feature parity identified as critical gap vs competitors. Team aligned on making this top priority for Q4 sprint planning.</div>
        <div class="note-entry-tag tag-decision">⬦ Decision</div>
      </div>
      <div class="note-entry">
        <div class="note-entry-time">00:11:35</div>
        <div class="note-entry-text">Sam to unblock design review by Friday. Jordan to follow up with design lead directly — calendar invite needed.</div>
        <div class="note-entry-tag tag-action">→ Action Item</div>
      </div>
      <div class="note-entry">
        <div class="note-entry-time">00:19:08</div>
        <div class="note-entry-text">Open question: Should we phase the mobile release or go all-in on a single launch date?</div>
        <div class="note-entry-tag tag-question">? Question</div>
      </div>
    </div>

    <div class="reveal reveal-delay-2">
      <h2 class="section-title">Notes that actually make sense.</h2>
      <p class="section-body">Asmat doesn't just transcribe — it understands. Actions, decisions, and open questions are automatically identified and structured so your team knows exactly what to do next.</p>
      <div style="margin-top:36px;display:flex;flex-direction:column;gap:16px;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(200,255,87,0.1);display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--accent);flex-shrink:0;">→</div>
          <div style="font-size:14px;color:#c8c5be;line-height:1.5;">Action items assigned to the right people, automatically</div>
        </div>
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(87,200,255,0.1);display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--accent2);flex-shrink:0;">◆</div>
          <div style="font-size:14px;color:#c8c5be;line-height:1.5;">Decisions captured with full context and timestamps</div>
        </div>
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,87,168,0.1);display:flex;align-items:center;justify-content:center;font-size:14px;color:#ff57a8;flex-shrink:0;">?</div>
          <div style="font-size:14px;color:#c8c5be;line-height:1.5;">Open questions surfaced so nothing falls through</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- HUMAN-LIKE -->
<section>
  <div class="section-tag">Human-like Intelligence</div>
  <h2 class="section-title reveal">It listens like a person, not a bot.</h2>

  <div class="human-grid" style="margin-top:60px;">
    <div class="human-card reveal">
      <div class="hc-number">01</div>
      <div class="hc-title">Context Aware</div>
      <div class="hc-text">Asmat understands who's speaking, what was said earlier, and how it relates to the agenda. Full conversational memory across the entire session.</div>
    </div>
    <div class="human-card reveal reveal-delay-1">
      <div class="hc-number">02</div>
      <div class="hc-title">Tone Sensitive</div>
      <div class="hc-text">Detects disagreement, excitement, uncertainty, and consensus. Emotional context shapes how notes are categorized and prioritized.</div>
    </div>
    <div class="human-card wide reveal reveal-delay-2">
      <div>
        <div class="hc-number">03</div>
        <div class="hc-title">Instant Response</div>
        <div class="hc-text">The moment you need an answer, a clarification, or a summary, Asmat responds. No waiting, no lag — like a colleague who's been in every meeting.</div>
      </div>
      <div class="response-demo">
        <div class="chat-bubble bubble-user">What did Sam say about the blocked sprints?</div>
        <div class="chat-bubble bubble-ai">At 00:11:35, Sam mentioned 3 sprints are blocked pending design sign-off. He suggested unblocking those before tackling the mobile roadmap.</div>
        <div class="response-time">Response in 180ms ⚡</div>
        <div class="chat-bubble bubble-user">Who owns the design sign-off?</div>
        <div class="chat-bubble bubble-ai">Not explicitly named in the meeting, but Jordan said he'd follow up with the design lead directly. Action item was logged.</div>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta-section" id="pricing">
  <div class="cta-glow"></div>
  <div class="hero-badge reveal" style="margin:0 auto 40px;">
    <div class="badge-blink"></div>
    Free during beta
  </div>
  <h2 class="cta-title reveal">
    Your meetings,<br><em>remembered.</em>
  </h2>
  <p class="cta-sub reveal reveal-delay-1">Join 2,400+ teams already running smarter meetings with Asmat.</p>
  <div style="display:flex;gap:16px;justify-content:center;" class="reveal reveal-delay-2">
    <button class="btn-primary" style="font-size:16px;padding:18px 44px;">Start for free — no card needed</button>
  </div>
  <p style="margin-top:24px;font-size:12px;color:var(--muted);font-family:'DM Mono',monospace;" class="reveal reveal-delay-3">Works with Zoom · Meet · Teams · Webex</p>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-logo">
    <div style="display:flex;align-items:center;gap:8px;">
      <div class="logo-dot"></div>
      Asmat
    </div>
  </div>
  <div class="footer-copy">© 2025 Asmat Inc. — Making meetings human again.</div>
</footer>

<!-- ============================================================
     CONTACT / EARLY ACCESS MODAL
     ============================================================ -->
<div id="modal-overlay" style="
  position:fixed;inset:0;z-index:10000;
  display:flex;align-items:center;justify-content:center;
  background:rgba(5,5,10,0.85);
  backdrop-filter:blur(16px);
  opacity:0;pointer-events:none;
  transition:opacity 0.4s;
">
  <div id="modal-box" style="
    background:linear-gradient(160deg,#111118,#0d0d14);
    border:1px solid rgba(200,255,87,0.15);
    border-radius:24px;
    padding:52px 48px;
    width:100%;max-width:500px;
    position:relative;
    transform:translateY(30px) scale(0.97);
    transition:transform 0.4s cubic-bezier(.22,1,.36,1);
    box-shadow:0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04);
  ">
    <!-- Close -->
    <button id="modal-close" style="
      position:absolute;top:20px;right:20px;
      background:rgba(255,255,255,0.06);border:1px solid var(--border);
      color:#888;width:32px;height:32px;border-radius:50%;
      font-size:16px;cursor:none;
      display:flex;align-items:center;justify-content:center;
      transition:background 0.2s,color 0.2s;
    ">×</button>

    <!-- Header -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <div style="width:8px;height:8px;background:var(--accent);border-radius:50%;animation:pulse 2s infinite;"></div>
      <span style="font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--accent);">Early Access</span>
    </div>
    <h2 style="font-size:32px;font-weight:800;letter-spacing:-0.03em;line-height:1.1;margin-bottom:10px;">Get in before<br>everyone else.</h2>
    <p style="font-size:14px;color:var(--muted);line-height:1.6;margin-bottom:36px;">We're onboarding teams carefully. Tell us a bit about yourself and we'll be in touch within 24 hrs.</p>

    <!-- Form -->
    <div id="modal-form">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
        <div>
          <label style="font-size:11px;font-family:'DM Mono',monospace;color:var(--muted);letter-spacing:0.06em;display:block;margin-bottom:8px;">FIRST NAME</label>
          <input id="f-first" type="text" placeholder="Jordan" style="
            width:100%;background:rgba(255,255,255,0.04);
            border:1px solid var(--border);border-radius:10px;
            padding:12px 16px;color:#e8e5de;font-family:'Sora',sans-serif;font-size:14px;
            outline:none;transition:border-color 0.2s,box-shadow 0.2s;
          ">
        </div>
        <div>
          <label style="font-size:11px;font-family:'DM Mono',monospace;color:var(--muted);letter-spacing:0.06em;display:block;margin-bottom:8px;">LAST NAME</label>
          <input id="f-last" type="text" placeholder="Kim" style="
            width:100%;background:rgba(255,255,255,0.04);
            border:1px solid var(--border);border-radius:10px;
            padding:12px 16px;color:#e8e5de;font-family:'Sora',sans-serif;font-size:14px;
            outline:none;transition:border-color 0.2s,box-shadow 0.2s;
          ">
        </div>
      </div>
      <div style="margin-bottom:14px;">
        <label style="font-size:11px;font-family:'DM Mono',monospace;color:var(--muted);letter-spacing:0.06em;display:block;margin-bottom:8px;">WORK EMAIL</label>
        <input id="f-email" type="email" placeholder="jordan@company.com" style="
          width:100%;background:rgba(255,255,255,0.04);
          border:1px solid var(--border);border-radius:10px;
          padding:12px 16px;color:#e8e5de;font-family:'Sora',sans-serif;font-size:14px;
          outline:none;transition:border-color 0.2s,box-shadow 0.2s;
        ">
      </div>
      <div style="margin-bottom:14px;">
        <label style="font-size:11px;font-family:'DM Mono',monospace;color:var(--muted);letter-spacing:0.06em;display:block;margin-bottom:8px;">COMPANY</label>
        <input id="f-company" type="text" placeholder="Acme Inc." style="
          width:100%;background:rgba(255,255,255,0.04);
          border:1px solid var(--border);border-radius:10px;
          padding:12px 16px;color:#e8e5de;font-family:'Sora',sans-serif;font-size:14px;
          outline:none;transition:border-color 0.2s,box-shadow 0.2s;
        ">
      </div>
      <div style="margin-bottom:14px;">
        <label style="font-size:11px;font-family:'DM Mono',monospace;color:var(--muted);letter-spacing:0.06em;display:block;margin-bottom:8px;">USE CASE</label>
        <select id="f-usecase" style="
          width:100%;background:rgba(255,255,255,0.04);
          border:1px solid var(--border);border-radius:10px;
          padding:12px 16px;color:#e8e5de;font-family:'Sora',sans-serif;font-size:14px;
          outline:none;cursor:none;appearance:none;
          background-image:url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22%23888%22 viewBox=%220 0 24 24%22><path d=%22M7 10l5 5 5-5z%22/></svg>');
          background-repeat:no-repeat;background-position:right 12px center;background-size:20px;
        ">
          <option value="" style="background:#111118">Select your primary use case…</option>
          <option value="interviews" style="background:#111118">Interview & Hiring</option>
          <option value="standup" style="background:#111118">Team Standups</option>
          <option value="client" style="background:#111118">Client Meetings</option>
          <option value="strategy" style="background:#111118">Strategy Sessions</option>
          <option value="other" style="background:#111118">Other</option>
        </select>
      </div>
      <div style="margin-bottom:28px;">
        <label style="font-size:11px;font-family:'DM Mono',monospace;color:var(--muted);letter-spacing:0.06em;display:block;margin-bottom:8px;">TEAM SIZE</label>
        <div style="display:flex;gap:8px;" id="team-size-picker">
          <button class="size-btn" data-val="1-5" style="flex:1;padding:10px 4px;border:1px solid var(--border);border-radius:8px;background:rgba(255,255,255,0.03);color:var(--muted);font-size:12px;font-family:'DM Mono',monospace;cursor:none;transition:all 0.2s;">1–5</button>
          <button class="size-btn" data-val="6-20" style="flex:1;padding:10px 4px;border:1px solid var(--border);border-radius:8px;background:rgba(255,255,255,0.03);color:var(--muted);font-size:12px;font-family:'DM Mono',monospace;cursor:none;transition:all 0.2s;">6–20</button>
          <button class="size-btn" data-val="21-100" style="flex:1;padding:10px 4px;border:1px solid var(--border);border-radius:8px;background:rgba(255,255,255,0.03);color:var(--muted);font-size:12px;font-family:'DM Mono',monospace;cursor:none;transition:all 0.2s;">21–100</button>
          <button class="size-btn" data-val="100+" style="flex:1;padding:10px 4px;border:1px solid var(--border);border-radius:8px;background:rgba(255,255,255,0.03);color:var(--muted);font-size:12px;font-family:'DM Mono',monospace;cursor:none;transition:all 0.2s;">100+</button>
        </div>
      </div>
      <div id="form-error" style="display:none;color:#ff7070;font-size:12px;margin-bottom:14px;font-family:'DM Mono',monospace;"></div>
      <button id="form-submit" style="
        width:100%;background:var(--accent);color:var(--ink);
        border:none;padding:16px;border-radius:12px;
        font-family:'Sora',sans-serif;font-weight:700;font-size:15px;
        cursor:none;transition:transform 0.2s,box-shadow 0.2s;
        position:relative;overflow:hidden;
      ">
        Request Early Access →
      </button>
      <p style="text-align:center;margin-top:14px;font-size:11px;color:var(--muted);font-family:'DM Mono',monospace;">No spam. Ever. We'll only reach out about Asmat.</p>
    </div>

    <!-- Success State -->
    <div id="modal-success" style="display:none;text-align:center;padding:20px 0;">
      <div style="font-size:56px;margin-bottom:20px;">✦</div>
      <h3 style="font-size:24px;font-weight:800;letter-spacing:-0.03em;margin-bottom:12px;">You're on the list.</h3>
      <p style="font-size:14px;color:var(--muted);line-height:1.6;max-width:320px;margin:0 auto 28px;">We'll review your request and be in touch within 24 hours. Watch your inbox.</p>
      <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(200,255,87,0.08);border:1px solid rgba(200,255,87,0.2);padding:8px 20px;border-radius:100px;">
        <div style="width:6px;height:6px;background:var(--accent);border-radius:50%;animation:blink 1s infinite;"></div>
        <span style="font-size:12px;font-family:'DM Mono',monospace;color:var(--accent);letter-spacing:0.06em;">APPLICATION RECEIVED</span>
      </div>
    </div>
  </div>
</div>

<!-- TOAST NOTIFICATION -->
<div id="toast" style="
  position:fixed;bottom:32px;left:50%;transform:translateX(-50%) translateY(80px);
  z-index:9990;background:rgba(20,20,28,0.95);
  border:1px solid var(--border);border-radius:100px;
  padding:12px 24px;display:flex;align-items:center;gap:10px;
  font-size:13px;white-space:nowrap;
  box-shadow:0 20px 60px rgba(0,0,0,0.5);
  transition:transform 0.4s cubic-bezier(.22,1,.36,1),opacity 0.4s;
  opacity:0;pointer-events:none;
"></div>

<!-- FEATURE DETAIL DRAWER -->
<div id="drawer" style="
  position:fixed;bottom:0;left:0;right:0;z-index:5000;
  background:linear-gradient(180deg,#0f0f18,#0a0a0f);
  border-top:1px solid var(--border);
  padding:40px 60px;
  transform:translateY(100%);
  transition:transform 0.5s cubic-bezier(.22,1,.36,1);
  max-height:60vh;overflow-y:auto;
">
  <button id="drawer-close" style="
    position:absolute;top:20px;right:24px;
    background:rgba(255,255,255,0.06);border:1px solid var(--border);
    color:#888;width:32px;height:32px;border-radius:50%;
    font-size:16px;cursor:none;
    display:flex;align-items:center;justify-content:center;
    transition:background 0.2s;
  ">×</button>
  <div id="drawer-content"></div>
</div>

<style>
  input:focus, select:focus {
    border-color: rgba(200,255,87,0.4) !important;
    box-shadow: 0 0 0 3px rgba(200,255,87,0.08) !important;
  }
  input::placeholder { color: #444; }
  .size-btn.selected {
    border-color: var(--accent) !important;
    background: rgba(200,255,87,0.12) !important;
    color: var(--accent) !important;
  }
  .modal-open { overflow: hidden; }
  .candidate-row { cursor: none; }
  .candidate-row:hover { background: rgba(255,255,255,0.03); border-radius: 10px; }

  /* Ripple */
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    transform: scale(0);
    animation: rippleAnim 0.6s linear;
    pointer-events: none;
  }
  @keyframes rippleAnim {
    to { transform: scale(4); opacity: 0; }
  }

  /* Sidebar item click feedback */
  .sidebar-item { transition: background 0.2s, color 0.2s, transform 0.15s; }
  .sidebar-item:active { transform: scale(0.96); }

  /* Note entry hover */
  .note-entry {
    transition: background 0.2s;
    border-radius: 8px;
    padding: 8px;
    margin: -8px;
    cursor: none;
  }
  .note-entry:hover { background: rgba(255,255,255,0.03); }

  /* Drawer scrollbar */
  #drawer::-webkit-scrollbar { width: 4px; }
  #drawer::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

  /* Chat input area */
  .chat-input-wrap {
    display: flex; gap: 10px; margin-top: 16px;
    border-top: 1px solid var(--border); padding-top: 14px;
  }
  .chat-input {
    flex: 1; background: rgba(255,255,255,0.04);
    border: 1px solid var(--border); border-radius: 10px;
    padding: 10px 14px; color: #e8e5de;
    font-family: 'Sora', sans-serif; font-size: 12px;
    outline: none; transition: border-color 0.2s;
  }
  .chat-input:focus { border-color: rgba(200,255,87,0.3); }
  .chat-send {
    background: var(--accent); color: var(--ink);
    border: none; border-radius: 10px;
    padding: 10px 16px; font-size: 12px; font-weight: 700;
    cursor: none; transition: transform 0.15s, box-shadow 0.15s;
    font-family: 'Sora', sans-serif;
  }
  .chat-send:hover { transform: scale(1.05); box-shadow: 0 4px 20px rgba(200,255,87,0.3); }
  .chat-send:active { transform: scale(0.97); }

  /* Waveform click to pause/play */
  #waveform { cursor: none; transition: opacity 0.3s; }
  #waveform.paused .wave-bar { animation-play-state: paused; opacity: 0.3; }

  /* Score ring clickable */
  .score-ring { cursor: none; }
  .metric-row { cursor: none; transition: opacity 0.2s; }
  .metric-row:hover { opacity: 0.8; }
</style>

<script>
  /* ── CURSOR ─────────────────────────────────────────────── */
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  function setCursorLarge() { cursor.style.width='20px';cursor.style.height='20px';ring.style.width='60px';ring.style.height='60px'; }
  function setCursorNormal() { cursor.style.width='12px';cursor.style.height='12px';ring.style.width='40px';ring.style.height='40px'; }

  document.querySelectorAll('button, a, .feature-card, .human-card, .candidate-row, .note-entry, .sidebar-item, .metric-row, #waveform').forEach(el => {
    el.addEventListener('mouseenter', setCursorLarge);
    el.addEventListener('mouseleave', setCursorNormal);
  });

  /* ── RIPPLE EFFECT on buttons ───────────────────────────── */
  function addRipple(btn) {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.addEventListener('click', function(e) {
      const r = document.createElement('span');
      r.className = 'ripple';
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.width = r.style.height = size + 'px';
      r.style.left = (e.clientX - rect.left - size/2) + 'px';
      r.style.top  = (e.clientY - rect.top  - size/2) + 'px';
      btn.appendChild(r);
      setTimeout(() => r.remove(), 700);
    });
  }
  document.querySelectorAll('.btn-primary, .nav-cta, .chat-send').forEach(addRipple);

  /* ── NAV SCROLL ─────────────────────────────────────────── */
  window.addEventListener('scroll', () => {
    document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 50);
  });

  /* ── MODAL ──────────────────────────────────────────────── */
  const overlay = document.getElementById('modal-overlay');
  const modalBox = document.getElementById('modal-box');

  function openModal() {
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'auto';
    modalBox.style.transform = 'translateY(0) scale(1)';
    document.body.classList.add('modal-open');
  }
  function closeModal() {
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    modalBox.style.transform = 'translateY(30px) scale(0.97)';
    document.body.classList.remove('modal-open');
  }

  // All CTA buttons open modal
  document.querySelectorAll('.nav-cta, .btn-primary').forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  document.getElementById('modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ── TEAM SIZE PICKER ───────────────────────────────────── */
  let selectedSize = '';
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedSize = btn.dataset.val;
    });
  });

  /* ── FORM INPUTS: focus glow ────────────────────────────── */
  document.querySelectorAll('#modal-box input, #modal-box select').forEach(el => {
    el.addEventListener('focus', () => { el.style.borderColor = 'rgba(200,255,87,0.5)'; });
    el.addEventListener('blur',  () => { el.style.borderColor = 'rgba(255,255,255,0.08)'; });
  });

  /* ── FORM SUBMIT ────────────────────────────────────────── */
  document.getElementById('form-submit').addEventListener('click', () => {
    const first   = document.getElementById('f-first').value.trim();
    const last    = document.getElementById('f-last').value.trim();
    const email   = document.getElementById('f-email').value.trim();
    const company = document.getElementById('f-company').value.trim();
    const usecase = document.getElementById('f-usecase').value;
    const errEl   = document.getElementById('form-error');

    if (!first || !last) { errEl.textContent = '↳ Please enter your full name.'; errEl.style.display='block'; return; }
    if (!email || !email.includes('@')) { errEl.textContent = '↳ Please enter a valid email address.'; errEl.style.display='block'; return; }
    if (!company) { errEl.textContent = '↳ Please enter your company name.'; errEl.style.display='block'; return; }
    if (!usecase) { errEl.textContent = '↳ Please select a use case.'; errEl.style.display='block'; return; }
    errEl.style.display = 'none';

    const btn = document.getElementById('form-submit');
    btn.textContent = 'Submitting…';
    btn.style.opacity = '0.7';

    setTimeout(() => {
      document.getElementById('modal-form').style.display = 'none';
      document.getElementById('modal-success').style.display = 'block';
    }, 1200);
  });

  /* ── TOAST helper ───────────────────────────────────────── */
  function showToast(icon, msg, color = '#e8e5de') {
    const t = document.getElementById('toast');
    t.innerHTML = `<span style="font-size:16px">${icon}</span><span style="color:${color};font-family:'DM Mono',monospace;font-size:12px;letter-spacing:0.04em">${msg}</span>`;
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(-50%) translateY(80px)';
    }, 2800);
  }

  /* ── FEATURE DRAWER ─────────────────────────────────────── */
  const drawer = document.getElementById('drawer');
  const drawerContent = document.getElementById('drawer-content');
  document.getElementById('drawer-close').addEventListener('click', () => {
    drawer.style.transform = 'translateY(100%)';
  });

  const featureDetails = {
    0: {
      title: '◎ Instant Reaction',
      color: '#c8ff57',
      body: `Asmat processes speech through a locally-cached STT pipeline with less than 200ms end-to-end latency. Unlike cloud-first tools, the first pass runs on-device — meaning your words are captured even if connectivity drops. As you speak, Asmat is already matching context from earlier in the conversation to surface the right insight at the right moment.`,
      stats: [
        { label: 'Avg. response time', val: '180ms' },
        { label: 'Offline capable', val: 'Yes' },
        { label: 'Languages supported', val: '42' },
      ]
    },
    1: {
      title: '✦ Smart Notes',
      color: '#57c8ff',
      body: `Every meeting generates three layers: a raw transcript, a structured summary, and an action layer. The action layer extracts who said what, assigns ownership, and creates a task map you can export to Notion, Linear, or Jira with one click. Notes arrive in your inbox 90 seconds after the call ends.`,
      stats: [
        { label: 'Note generation', val: '< 90s' },
        { label: 'Integrations', val: '14' },
        { label: 'Accuracy rate', val: '97.3%' },
      ]
    },
    2: {
      title: '⬡ Interview Benchmark',
      color: '#c4a9ff',
      body: `Score candidates across 12 dimensions — clarity, depth, conciseness, confidence, relevance, and more. Asmat compares responses against your defined rubric and surfaces patterns across all candidates in a role. Hiring managers report 3.4× faster decisions and significantly reduced unconscious bias with structured scoring.`,
      stats: [
        { label: 'Scoring dimensions', val: '12' },
        { label: 'Panel accuracy match', val: '94%' },
        { label: 'Decision speed', val: '3.4× faster' },
      ]
    }
  };

  document.querySelectorAll('.feature-card').forEach((card, i) => {
    card.style.cursor = 'none';
    card.addEventListener('click', () => {
      const d = featureDetails[i];
      if (!d) return;
      drawerContent.innerHTML = `
        <div style="max-width:800px">
          <div style="font-family:'DM Mono',monospace;font-size:11px;color:${d.color};letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Feature detail</div>
          <h3 style="font-size:28px;font-weight:800;letter-spacing:-0.03em;margin-bottom:16px;">${d.title}</h3>
          <p style="font-size:15px;color:#c8c5be;line-height:1.7;margin-bottom:28px;">${d.body}</p>
          <div style="display:flex;gap:32px;flex-wrap:wrap;">
            ${d.stats.map(s => `
              <div>
                <div style="font-size:24px;font-weight:800;color:${d.color};letter-spacing:-0.04em;">${s.val}</div>
                <div style="font-size:12px;color:var(--muted);margin-top:4px;font-family:'DM Mono',monospace;">${s.label}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      drawer.style.transform = 'translateY(0)';
    });
  });

  /* ── WAVEFORM click to pause/play ───────────────────────── */
  const wv = document.getElementById('waveform');
  let wavePaused = false;
  wv.addEventListener('click', () => {
    wavePaused = !wavePaused;
    wv.classList.toggle('paused', wavePaused);
    showToast(wavePaused ? '⏸' : '▶', wavePaused ? 'AUDIO PAUSED' : 'AUDIO RESUMED', 'var(--accent)');
  });

  /* ── BUILD WAVEFORM ─────────────────────────────────────── */
  for (let i = 0; i < 60; i++) {
    const bar = document.createElement('div');
    bar.className = 'wave-bar';
    const h = Math.random() * 40 + 4;
    bar.style.setProperty('--h', h + 'px');
    bar.style.animationDuration = (0.5 + Math.random() * 0.8) + 's';
    bar.style.animationDelay = (Math.random() * 0.5) + 's';
    wv.appendChild(bar);
  }

  /* ── SIDEBAR NAVIGATION ─────────────────────────────────── */
  const sidebarLabels = ['Live Session','Notes','Benchmark','History','Reports'];
  document.querySelectorAll('.sidebar-item').forEach((item, i) => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      showToast('◈', `${sidebarLabels[i].toUpperCase()} VIEW`, 'var(--accent)');
    });
  });

  /* ── REC BADGE click: toggle recording ──────────────────── */
  const recBadge = document.querySelector('.rec-badge');
  let isRecording = true;
  if (recBadge) {
    recBadge.style.cursor = 'none';
    recBadge.addEventListener('click', () => {
      isRecording = !isRecording;
      recBadge.innerHTML = isRecording
        ? `<div class="rec-dot"></div> REC 00:23:47`
        : `<div style="width:6px;height:6px;background:#888;border-radius:50%;"></div> PAUSED`;
      recBadge.style.background = isRecording ? 'rgba(255,87,87,0.15)' : 'rgba(255,255,255,0.06)';
      recBadge.style.color = isRecording ? '#ff7070' : '#888';
      showToast(isRecording ? '⏺' : '⏸', isRecording ? 'RECORDING RESUMED' : 'RECORDING PAUSED', isRecording ? '#ff7070' : '#888');
    });
  }

  /* ── CANDIDATE ROW clicks ───────────────────────────────── */
  const candidateData = [
    { name: 'Aiko Nakamura', score: 92, detail: 'Exceptional communication clarity. Strong portfolio. Recommended for final round.' },
    { name: 'Diego Pereira', score: 87, detail: 'Solid technical depth. Some hesitation on system design question. Good cultural fit.' },
    { name: 'Maya Thompson', score: 74, detail: 'Creative background strong. Needs more experience with cross-functional collaboration.' },
    { name: 'James Liu', score: 61, detail: 'Junior profile. Consider for an associate role instead. Follow up in 6 months.' },
  ];
  document.querySelectorAll('.candidate-row').forEach((row, i) => {
    if (!candidateData[i]) return;
    row.addEventListener('click', () => {
      const cd = candidateData[i];
      const color = cd.score >= 85 ? 'var(--accent)' : cd.score >= 70 ? 'var(--accent2)' : '#ff7070';
      drawerContent.innerHTML = `
        <div style="display:flex;align-items:flex-start;gap:32px;flex-wrap:wrap;max-width:800px;">
          <div>
            <div style="font-family:'DM Mono',monospace;font-size:11px;color:${color};letter-spacing:0.1em;margin-bottom:10px;">CANDIDATE REPORT</div>
            <h3 style="font-size:28px;font-weight:800;letter-spacing:-0.03em;margin-bottom:6px;">${cd.name}</h3>
            <p style="font-size:14px;color:var(--muted);margin-bottom:20px;font-family:'DM Mono',monospace;">Composite Score: <span style="color:${color};font-weight:700;">${cd.score}/100</span></p>
            <p style="font-size:15px;color:#c8c5be;line-height:1.7;max-width:520px;">${cd.detail}</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:14px;min-width:200px;">
            ${['Communication','Technical Depth','Cultural Fit','Problem Solving'].map((dim, j) => {
              const v = Math.round(cd.score + (Math.random()-0.5)*20);
              const clamped = Math.min(100, Math.max(40, v));
              return `<div>
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                  <span style="font-size:11px;color:var(--muted);font-family:'DM Mono',monospace;">${dim}</span>
                  <span style="font-size:11px;color:${color};font-family:'DM Mono',monospace;">${clamped}%</span>
                </div>
                <div style="height:3px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden;">
                  <div style="height:100%;width:${clamped}%;background:${color};border-radius:2px;"></div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      `;
      drawer.style.transform = 'translateY(0)';
    });
  });

  /* ── NOTE ENTRIES: click to copy ────────────────────────── */
  document.querySelectorAll('.note-entry').forEach(entry => {
    entry.addEventListener('click', () => {
      const text = entry.querySelector('.note-entry-text')?.textContent || '';
      navigator.clipboard.writeText(text).catch(() => {});
      showToast('◆', 'NOTE COPIED TO CLIPBOARD', 'var(--accent2)');
    });
  });

  /* ── RESPONSE DEMO: live chat input ─────────────────────── */
  const responseDemo = document.querySelector('.response-demo');
  if (responseDemo) {
    const inputWrap = document.createElement('div');
    inputWrap.className = 'chat-input-wrap';
    inputWrap.innerHTML = `
      <input class="chat-input" placeholder="Ask Asmat about this meeting…" />
      <button class="chat-send">Ask</button>
    `;
    responseDemo.appendChild(inputWrap);
    addRipple(inputWrap.querySelector('.chat-send'));

    const aiReplies = {
      'default': "I don't have a specific note on that, but based on the conversation context, the team seemed aligned on prioritizing speed over breadth for Q4.",
      'action': "Action items logged: (1) Sam to unblock design review by Friday. (2) Jordan to follow up with design lead and send calendar invite.",
      'decision': "Key decision: Mobile feature parity is the #1 Q4 priority. Team reached consensus at 00:04:12.",
      'summary': "Meeting summary: 5 attendees, 23 minutes. Main topic: Q4 roadmap. 2 action items, 1 key decision, 1 open question. Full notes available.",
      'sam': "Sam Rivera (Engineering) mentioned 3 sprints are blocked pending design sign-off at 00:11:35. He proposed unblocking these before tackling the mobile roadmap.",
      'jordan': "Jordan Kim (Product Lead) opened the discussion about mobile feature gaps at 00:04:12 and committed to following up with the design lead.",
    };

    function getReply(q) {
      const lq = q.toLowerCase();
      if (lq.includes('action')) return aiReplies.action;
      if (lq.includes('decision')) return aiReplies.decision;
      if (lq.includes('summary') || lq.includes('summar')) return aiReplies.summary;
      if (lq.includes('sam')) return aiReplies.sam;
      if (lq.includes('jordan')) return aiReplies.jordan;
      return aiReplies.default;
    }

    function sendMessage() {
      const inp = inputWrap.querySelector('.chat-input');
      const q = inp.value.trim();
      if (!q) return;
      inp.value = '';

      // User bubble
      const userBubble = document.createElement('div');
      userBubble.className = 'chat-bubble bubble-user';
      userBubble.textContent = q;
      responseDemo.insertBefore(userBubble, inputWrap);

      // Typing indicator
      const typingBubble = document.createElement('div');
      typingBubble.className = 'chat-bubble bubble-ai';
      typingBubble.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
      responseDemo.insertBefore(typingBubble, inputWrap);

      const start = Date.now();
      setTimeout(() => {
        const elapsed = Date.now() - start;
        typingBubble.innerHTML = getReply(q);

        const timeEl = document.createElement('div');
        timeEl.className = 'response-time';
        timeEl.textContent = `Response in ${elapsed}ms ⚡`;
        responseDemo.insertBefore(timeEl, inputWrap);

        // Scroll to bottom
        responseDemo.scrollTop = responseDemo.scrollHeight;
      }, 600 + Math.random() * 400);
    }

    inputWrap.querySelector('.chat-send').addEventListener('click', sendMessage);
    inputWrap.querySelector('.chat-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') sendMessage();
    });

    responseDemo.style.maxHeight = '320px';
    responseDemo.style.overflowY = 'auto';
  }

  /* ── METRIC ROW click: drill-down toast ─────────────────── */
  const metricLabels = [
    { name:'Clarity', tip:'Candidate used clear, direct language without unnecessary filler words.' },
    { name:'Depth',   tip:'Answers went beyond surface-level — candidate demonstrated subject expertise.' },
    { name:'Pace',    tip:'Speech rate was comfortable: ~140 wpm. Pauses were well-placed.' },
  ];
  document.querySelectorAll('.metric-row').forEach((row, i) => {
    if (!metricLabels[i]) return;
    row.addEventListener('click', () => {
      showToast('◈', metricLabels[i].tip.toUpperCase().slice(0,48) + '…', 'var(--accent)');
    });
  });

  /* ── HUMAN CARDS click ──────────────────────────────────── */
  const humanDetails = [
    { icon:'◎', title:'Context Aware', tip:'FULL SESSION MEMORY — 4 HOURS OF CONTEXT WINDOW' },
    { icon:'◆', title:'Tone Sensitive', tip:'12 EMOTIONAL SIGNALS TRACKED IN REAL TIME' },
  ];
  document.querySelectorAll('.human-card:not(.wide)').forEach((card, i) => {
    card.style.cursor = 'none';
    if (!humanDetails[i]) return;
    card.addEventListener('click', () => {
      showToast(humanDetails[i].icon, humanDetails[i].tip, 'var(--accent)');
    });
  });

  /* ── SCROLL REVEAL ──────────────────────────────────────── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  /* ── TYPING LOOP ─────────────────────────────────────────── */
  function loopTyping() {
    const texts = [
      "Noted: 3 sprints blocked pending design sign-off",
      "Action item logged → Jordan follows up with design lead",
      "Decision: Mobile features are Q4 top priority",
      "Question flagged: Phase vs single launch date?"
    ];
    let i = 0;
    const el = document.querySelector('.typing');
    if (!el) return;

    function showNext() {
      const textEl = document.createElement('div');
      textEl.className = 'transcript-text';
      textEl.style.fontSize = '12px';
      textEl.style.color = 'var(--accent)';
      textEl.style.fontFamily = "'DM Mono', monospace";
      textEl.style.opacity = '0';
      textEl.style.transition = 'opacity 0.5s';
      textEl.textContent = texts[i % texts.length];
      el.parentNode.insertBefore(textEl, el);
      setTimeout(() => textEl.style.opacity = '1', 50);
      setTimeout(() => { textEl.style.opacity = '0'; setTimeout(() => textEl.remove(), 500); }, 3000);
      i++;
    }
    showNext();
    setInterval(showNext, 4000);
  }
  setTimeout(loopTyping, 2000);

  /* ── MODAL input hover cursor expand ─────────────────────── */
  document.querySelectorAll('#modal-box input, #modal-box select, #modal-box button').forEach(el => {
    el.addEventListener('mouseenter', setCursorLarge);
    el.addEventListener('mouseleave', setCursorNormal);
  });
</script>
</body>
</html>
