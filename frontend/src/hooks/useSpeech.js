import { useState, useRef, useCallback } from "react";

function cleanTextForSpeech(raw) {
  if (!raw) return "";
  return raw
    .split("\n")
    .filter((line) => !line.startsWith("MAP_LINK:"))
    .join("\n")
    .trim();
}

/** Devanagari block (Hindi, Marathi, etc.) — if present, prefer Hindi TTS. */
function shouldUseHindiVoice(text) {
  let devanagari = 0;
  let latinLetters = 0;
  for (const ch of text) {
    const c = ch.codePointAt(0);
    if (c >= 0x0900 && c <= 0x097f) devanagari++;
    else if (
      (c >= 0x41 && c <= 0x5a) ||
      (c >= 0x61 && c <= 0x7a) ||
      (c >= 0xc0 && c <= 0x24f)
    ) {
      latinLetters++;
    }
  }
  if (devanagari >= 1) return true;
  if (devanagari > 0 && devanagari >= latinLetters * 0.25) return true;
  return false;
}

function pickVoiceForLang(lang) {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices?.length) return null;

  const norm = (s) => (s || "").toLowerCase().replace(/_/g, "-");
  const target = norm(lang);
  const base = target.split("-")[0] || target;

  const exact = voices.find((v) => norm(v.lang) === target);
  if (exact) return exact;

  const prefix = voices.find(
    (v) => norm(v.lang).startsWith(`${base}-`) || norm(v.lang) === base
  );
  if (prefix) return prefix;

  if (base === "hi") {
    const hiLang = voices.filter((v) => {
      const L = norm(v.lang);
      return L === "hi" || L.startsWith("hi-") || L.startsWith("hi_");
    });
    if (hiLang.length) {
      const preferIn = hiLang.find((v) => norm(v.lang) === "hi-in") || hiLang[0];
      return preferIn;
    }
    const byName = voices.find((v) => {
      const n = `${v.name || ""} ${v.lang || ""}`;
      return (
        /hindi|हिन्दी|हिंदी|hemant|swara|kalpana|madhur|neerja/i.test(n) ||
        (/microsoft/i.test(v.name || "") && /\bhi\b|hindi|india/i.test(n))
      );
    });
    if (byName) return byName;
  }

  return null;
}

function resolveUtteranceVoice(utterance, lang) {
  utterance.lang = lang;
  const voice = pickVoiceForLang(lang);
  if (voice) {
    try {
      utterance.voice = voice;
    } catch {
      /* some browsers throw if voice incompatible */
    }
  }
}

function safeResume(synth) {
  if (typeof synth.resume !== "function") return;
  try {
    synth.resume();
  } catch {
    /* ignore */
  }
}

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const activeCleanTextRef = useRef(null);
  const speakGenRef = useRef(0);
  const watchdogRef = useRef(null);

  const stopSpeech = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
    speakGenRef.current += 1;
    window.speechSynthesis.cancel();
    safeResume(window.speechSynthesis);
    activeCleanTextRef.current = null;
    setIsSpeaking(false);
  }, []);

  const speakText = useCallback(
    (text) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;

      const clean = cleanTextForSpeech(text);
      if (!clean) return;

      const synth = window.speechSynthesis;

      if (
        activeCleanTextRef.current === clean &&
        synth.speaking
      ) {
        stopSpeech();
        return;
      }

      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current);
        watchdogRef.current = null;
      }

      const gen = ++speakGenRef.current;

      synth.cancel();
      safeResume(synth);

      const lang = shouldUseHindiVoice(clean) ? "hi-IN" : "en-US";
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = lang === "hi-IN" ? 0.92 : 0.95;

      const finish = () => {
        if (speakGenRef.current !== gen) return;
        if (watchdogRef.current) {
          clearTimeout(watchdogRef.current);
          watchdogRef.current = null;
        }
        activeCleanTextRef.current = null;
        setIsSpeaking(false);
      };

      utterance.onend = finish;
      utterance.onerror = finish;

      activeCleanTextRef.current = clean;
      setIsSpeaking(true);

      let speakQueued = false;
      let hindiPollId = null;
      let hindiTimeoutId = null;

      const cleanupHindiWaiters = () => {
        if (hindiPollId != null) {
          window.clearInterval(hindiPollId);
          hindiPollId = null;
        }
        if (hindiTimeoutId != null) {
          window.clearTimeout(hindiTimeoutId);
          hindiTimeoutId = null;
        }
      };

      const doSpeak = () => {
        if (speakGenRef.current !== gen || speakQueued) return;
        speakQueued = true;
        cleanupHindiWaiters();
        void synth.getVoices();
        resolveUtteranceVoice(utterance, lang);
        try {
          synth.speak(utterance);
        } catch {
          finish();
          return;
        }
        safeResume(synth);
        queueMicrotask(() => safeResume(synth));
      };

      void synth.getVoices();
      resolveUtteranceVoice(utterance, lang);

      if (lang !== "hi-IN") {
        if (synth.getVoices().length > 0) {
          doSpeak();
        } else {
          const onVoices = () => {
            synth.removeEventListener("voiceschanged", onVoices);
            doSpeak();
          };
          synth.addEventListener("voiceschanged", onVoices);
          window.setTimeout(() => {
            synth.removeEventListener("voiceschanged", onVoices);
            doSpeak();
          }, 600);
        }
      } else if (pickVoiceForLang(lang)) {
        doSpeak();
      } else {
        const onHindiVoices = () => {
          void synth.getVoices();
          resolveUtteranceVoice(utterance, lang);
          if (pickVoiceForLang(lang)) {
            synth.removeEventListener("voiceschanged", onHindiVoices);
            doSpeak();
          }
        };
        synth.addEventListener("voiceschanged", onHindiVoices);

        hindiPollId = window.setInterval(() => {
          if (speakGenRef.current !== gen) {
            window.clearInterval(hindiPollId);
            hindiPollId = null;
            synth.removeEventListener("voiceschanged", onHindiVoices);
            return;
          }
          void synth.getVoices();
          resolveUtteranceVoice(utterance, lang);
          if (pickVoiceForLang(lang)) {
            synth.removeEventListener("voiceschanged", onHindiVoices);
            doSpeak();
          }
        }, 120);

        hindiTimeoutId = window.setTimeout(() => {
          synth.removeEventListener("voiceschanged", onHindiVoices);
          doSpeak();
        }, 3200);
      }

      const watchdogMs = lang === "hi-IN" ? 12000 : 1500;
      watchdogRef.current = window.setTimeout(() => {
        watchdogRef.current = null;
        if (speakGenRef.current !== gen) return;
        const pending = typeof synth.pending === "boolean" ? synth.pending : false;
        if (!synth.speaking && !pending) {
          finish();
        }
      }, watchdogMs);
    },
    [stopSpeech]
  );

  return {
    isSpeaking,
    speakText,
    stopSpeech,
  };
}
