"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  formatPrix,
  calculerEconomie,
  calculerCommission,
  STATUT_BIEN_LABELS,
  TYPE_BIEN_LABELS,
} from "@/lib/types";

// ============================================================
// NÉGOCIATION PING-PONG v4 - Acquéreur LEFT, Vendeur RIGHT
// ============================================================

export default function BienDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [bien, setBien] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // UI state
  const [uiMode, setUiMode] = useState<"idle" | "counter" | "editing" | "newOffer">("idle");
  const [editingMoveId, setEditingMoveId] = useState<string | null>(null);
  const [commentingMoveId, setCommentingMoveId] = useState<string | null>(null);
  const [counterAmount, setCounterAmount] = useState("");
  const [newOfferAmount, setNewOfferAmount] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [commentText, setCommentText] = useState("");
  const [firstOfferAmount, setFirstOfferAmount] = useState("");
  const [waitingNewOfferFrom, setWaitingNewOfferFrom] = useState<string | null>(null);
  const [pendingCounterCamp, setPendingCounterCamp] = useState<string | null>(null);