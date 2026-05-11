// Project placeholder images for the dashboard
export const getRandomProjectImage = () => {
  const images = [
    '/images/projects/construction-1.jpg',
    '/images/projects/construction-2.jpg',
    '/images/projects/construction-3.jpg',
    '/images/projects/construction-4.jpg',
    '/images/projects/construction-5.jpg',
    '/images/projects/construction-6.jpg',
    '/images/projects/construction-7.jpg',
    '/images/projects/construction-8.jpg',
    '/images/projects/construction-9.jpg',
    '/images/projects/construction-10.jpg'
  ];
  
  return images[Math.floor(Math.random() * images.length)];
};

export const getProjectImageByIndex = (index) => {
  const images = [
    '/images/projects/construction-1.jpg',
    '/images/projects/construction-2.jpg',
    '/images/projects/construction-3.jpg',
    '/images/projects/construction-4.jpg',
    '/images/projects/construction-5.jpg',
    '/images/projects/construction-6.jpg',
    '/images/projects/construction-7.jpg',
    '/images/projects/construction-8.jpg',
    '/images/projects/construction-9.jpg',
    '/images/projects/construction-10.jpg'
  ];
  
  return images[index % images.length];
};
