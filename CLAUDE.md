# CLAUDE.md — Proyek Web3 Hackathon

> Claude Code WAJIB baca & patuhi file ini dulu sebelum kerja apa pun.
> Ganti `<NAMA-PROJECT>` dan `<CHAIN>` sesuai proyek. Hapus baris yang tak relevan.

---

## 🔴 ATURAN WAJIB (jangan pernah dilanggar)

### 1. Identitas Git & GitHub
- Semua commit & push HARUS atas nama **VincenImanuell**. Sebelum commit pertama, pastikan:
  ```bash
  git config user.name "VincenImanuell"
  git config user.email "vincenimanuel13@gmail.com"   # email Vincen — pastikan terverifikasi di akun GitHub VincenImanuell
  ```
  > Kalau email di atas tidak terverifikasi di GitHub, commit tidak akan ter-atribut ke Vincen.
  > Alternatif aman: pakai email noreply GitHub → `VincenImanuell@users.noreply.github.com`.

### 2. JANGAN munculkan Claude sebagai contributor/author
- DILARANG menambahkan trailer apa pun ke commit, seperti:
  - ❌ `Co-Authored-By: Claude ...`
  - ❌ `🤖 Generated with Claude Code`
  - ❌ menyebut Claude/Anthropic di pesan commit atau body PR.
- Pesan commit ditulis **bersih, seolah-olah Vincen yang menulis** (bahasa manusia biasa).
- Author & committer git harus VincenImanuell, bukan Claude.

### 3. ZERO biaya tambahan — cuma pakai langganan Claude Max
- ❌ JANGAN pernah set atau pakai `ANTHROPIC_API_KEY` (itu menagih API rate, bukan kuota Max).
- ❌ JANGAN daftar/pakai layanan berbayar, RPC berbayar, atau MCP berbayar.
- ❌ JANGAN deploy ke **mainnet** (gas = uang asli). Hanya **testnet**.
- ✅ Hanya pakai yang **gratis**: testnet, faucet gratis, RPC publik gratis, local node, free-tier (tanpa kartu).
- Kalau suatu langkah butuh bayar/kartu kredit → **STOP & tanya dulu**, jangan jalan sendiri.

---

## ⚙️ Setting yang dijamin (taruh di `.claude/settings.json` proyek)
```json
{
  "includeCoAuthoredBy": false,
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(forge *)",
      "Bash(cast *)",
      "Bash(anvil *)",
      "Bash(npm run *)",
      "Bash(npx *)",
      "Bash(pnpm *)"
    ]
  }
}
```
> `includeCoAuthoredBy: false` = jaminan tingkat-mesin supaya trailer Claude tidak pernah ikut.
> Allowlist = lebih sedikit prompt izin → kerja lebih lancar.

---

## 🚀 Cara kerja biar MAKSIMAL (hemat kuota, hasil bagus)

1. **Plan dulu, baru eksekusi.** Untuk tugas non-trivial: rencanakan (plan mode), tunjukkan rencana, baru implementasi. Tujuan: one-shot, tidak buang kuota untuk revisi.
2. **Pilih model sesuai berat tugas:**
   - Opus → desain arsitektur kontrak, bug rumit, audit logika.
   - Sonnet → mayoritas coding, frontend, refactor.
   - Haiku → tugas kecil (test, format, rename).
3. **Paralelkan kerja besar** pakai subagents (eksplorasi codebase, review multi-file) supaya context utama tetap bersih.
4. **Verifikasi sebelum klaim selesai:** jalankan test/build. Gunakan `/simplify` setelah perubahan untuk cek kualitas & reuse.
5. **Hemat konteks:** front-load info penting di awal, `/compact` saat penuh, pakai `.gitignore`/abaikan file besar yang tak perlu dibaca.
6. **Jangan aktifkan banyak MCP sekaligus** (jaga <10) supaya context window tidak jebol.

---

## 🧱 Stack & konvensi (default hackathon — ubah bila perlu)

**Smart contract**
- Pakai **Foundry** (gratis, cepat): `forge` untuk build/test, `anvil` untuk local node, `cast` untuk interaksi. (Hardhat juga boleh kalau proyek menuntut.)
- **Wajib ada test** (`forge test`) sebelum commit. Tidak ada kontrak tanpa test.
- Deploy hanya ke **testnet `<CHAIN>`** (mis. Sepolia / Base Sepolia / Arbitrum Sepolia). Ambil gas dari **faucet gratis**.

**Frontend**
- **Next.js + wagmi + viml + RainbowKit** (atau ConnectKit) untuk wallet connect.
- Deploy preview ke **Vercel free tier** kalau perlu demo (gratis, tanpa kartu).

**RPC & tooling gratis**
- Pakai RPC publik gratis / endpoint default chain. Hindari yang minta kartu.
- Block explorer: Etherscan free API (key gratis) bila butuh verifikasi kontrak.

---

## 🔁 Alur commit/push standar
1. Kerja di branch fitur (bukan langsung `main`): `git checkout -b <fitur>`.
2. Pastikan `forge test` / `npm run build` lulus.
3. Commit bersih atas nama VincenImanuell (lihat Aturan #1 & #2).
4. Push: `git push -u origin <fitur>`.
5. Kalau bikin PR: body PR tanpa menyebut Claude.

---

## ✅ Definition of Done
- [ ] Test/build lulus.
- [ ] Commit & push sebagai **VincenImanuell**, tanpa jejak Claude.
- [ ] Tidak ada langkah berbayar / `ANTHROPIC_API_KEY` / mainnet.
- [ ] Hanya pakai tool & layanan gratis.
```
