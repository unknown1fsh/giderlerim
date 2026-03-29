import React from "react";

export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-brand-50 px-4 py-5 text-center dark:bg-white/[0.03]`}
    >
      <span className="mb-2 inline-block text-2xl">💸</span>
      <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
        Giderlerim
      </h3>
      <p className="text-gray-500 text-theme-sm dark:text-gray-400">
        Harcamalarınızı akıllıca takip edin.
      </p>
    </div>
  );
}
