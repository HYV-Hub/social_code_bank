import React, { useEffect } from 'react';

function Image({
  src,
  alt = "Image Name",
  className = "",
  ...props
}) {

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        e.target.src = "/assets/images/no_image.png"
      }}
      {...props}
    />
  );
}

export default Image;

const AppImage = () => {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.warn('Placeholder: AppImage is not implemented yet.');
  }, []);
  return (
    <div>
      {/* AppImage placeholder */}
    </div>
  );
};

export { AppImage };