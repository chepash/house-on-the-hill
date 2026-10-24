import { useState, type SubmitEvent } from 'react';
import { navigate } from 'astro:transitions/client';

type Props = {
  /** Haunt number -> page URL. */
  targets: Record<number, string>;
  labels: { label: string; submit: string; notFound: string };
};

export default function HauntJump({ targets, labels }: Props) {
  const [value, setValue] = useState('');
  const [notFound, setNotFound] = useState(false);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = targets[Number(value)];
    setNotFound(!target);
    if (target) navigate(target);
  }

  return (
    <form className="haunt-jump" onSubmit={handleSubmit}>
      <label className="haunt-jump__label" htmlFor="haunt-jump-input">
        {labels.label}
      </label>
      <div className="haunt-jump__row">
        <input
          id="haunt-jump-input"
          className="haunt-jump__input"
          type="number"
          inputMode="numeric"
          min={1}
          max={50}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setNotFound(false);
          }}
        />
        <button className="haunt-jump__submit" type="submit" disabled={!value}>
          {labels.submit}
        </button>
      </div>
      {notFound && (
        <p className="haunt-jump__error" role="alert">
          {labels.notFound}
        </p>
      )}
    </form>
  );
}
