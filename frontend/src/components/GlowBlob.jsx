// frontend/src/components/GlowBlob.jsx

const positionClasses = {
  'top-left': 'top-0 left-0',
  'top-right': 'top-0 right-0',
  'bottom-left': 'bottom-0 left-0',
  'bottom-right': 'bottom-0 right-0',
};

function GlowBlob({ position, backgroundColour }) {
  return (
    <div
      className={`absolute size-96 opacity-20 blur-[100px] hidden lg:block ${positionClasses[position]} ${backgroundColour}`}
    />
  );
}

export default GlowBlob;
