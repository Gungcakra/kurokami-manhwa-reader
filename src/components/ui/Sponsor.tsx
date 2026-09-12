// @ts-nocheck
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCertificate, faHandshake } from "@fortawesome/free-solid-svg-icons";
// 480px WebP derived from the 869KB source PNG — same mark, ~57KB.
import ambaBrand from "../../assets/images/logos/amba_brand.webp";

/**
 * Official sponsor block — sits at the very bottom of the home page, directly
 * above the footer. Single highlighted partner, so the layout centres on the
 * brand mark rather than a logo wall.
 */
const Sponsor = () => (
  <section aria-labelledby="sponsor-heading" className="w-full">
    <div className="flex items-center gap-2.5 mb-3">
      <span className="w-1 h-5 bg-[#EF4444] rounded-full flex-shrink-0" />
      <FontAwesomeIcon icon={faHandshake} className="text-[#EF4444] text-sm" />
      <h2 id="sponsor-heading" className="font-black text-sm sm:text-base tracking-tight">
        Official Sponsor
      </h2>
    </div>

    <div className="relative overflow-hidden rounded-2xl border border-[#EF4444]/25 bg-[#141417]">
      {/* warm glow behind the brand mark */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#EF4444]/12 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#EF4444] to-transparent" />

      <div className="relative flex flex-col sm:flex-row items-center gap-5 sm:gap-7 p-5 sm:p-7">
        {/* brand mark */}
        <div className="flex-shrink-0 flex items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 p-3 sm:p-4">
          <img
            src={ambaBrand.src}
            alt="AmbaStore — sponsor resmi Kurokami"
            loading="lazy"
            decoding="async"
            width={480}
            height={400}
            className="w-28 sm:w-36 md:w-40 h-auto object-contain"
          />
        </div>

        {/* copy */}
        <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-[10px] font-black uppercase tracking-widest">
            <FontAwesomeIcon icon={faCertificate} className="text-[9px]" />
            Official Sponsor
          </span>

          <h3 className="text-lg sm:text-xl font-black tracking-tight text-white break-words">
            AmbaStore
          </h3>

          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md">
            Kurokami didukung penuh oleh <span className="text-white font-semibold">AmbaStore</span> sebagai
            sponsor resmi.
            </p>

          <p className="text-zinc-600 text-[11px] mt-0.5">
            Tertarik jadi sponsor berikutnya?{" "}
            <a href="/info" className="text-[#EF4444] font-semibold hover:underline">
              Hubungi kami
            </a>
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default Sponsor;
