"use client";

import styles from "./star-wars-toggle-switch.module.css";

type StarWarsToggleSwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean, toggle: HTMLInputElement) => void;
};

/** The supplied BB-8 artwork, with a native, keyboard-accessible switch. */
export default function StarWarsToggleSwitch({
  checked,
  onCheckedChange,
}: StarWarsToggleSwitchProps) {
  return (
    <label
      className={styles["bb8-toggle"]}
      data-theme-toggle=""
    >
      <input
        className={styles["bb8-toggle__checkbox"]}
        type="checkbox"
        role="switch"
        aria-label="Dark mode"
        checked={checked}
        onChange={(event) =>
          onCheckedChange(event.target.checked, event.currentTarget)
        }
      />
      <div className={styles["bb8-toggle__container"]} aria-hidden="true">
        <div className={styles["bb8-toggle__scenery"]}>
          {Array.from({ length: 7 }, (_, index) => (
            <div key={index} className={styles["bb8-toggle__star"]} />
          ))}
          <div className={styles["tatto-1"]} />
          <div className={styles["tatto-2"]} />
          <div className={styles.gomrassen} />
          <div className={styles.hermes} />
          <div className={styles.chenini} />
          <div className={styles["bb8-toggle__cloud"]} />
          <div className={styles["bb8-toggle__cloud"]} />
          <div className={styles["bb8-toggle__cloud"]} />
        </div>
        <div className={styles.bb8}>
          <div className={styles["bb8__head-container"]}>
            <div className={styles.bb8__antenna} />
            <div className={styles.bb8__antenna} />
            <div className={styles.bb8__head} />
          </div>
          <div className={styles.bb8__body} />
        </div>
        <div className={styles.artificial__hidden}>
          <div className={styles.bb8__shadow} />
        </div>
      </div>
    </label>
  );
}
