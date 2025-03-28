import express from 'express';
const configViewEngine = (app) => {
  app.use(express.static('./src/public')); // Đảm bảo thư mục public tồn tại
  app.set('view engine', 'ejs');  // Đảm bảo có dòng này
  app.set('views', './src/views');    // Đảm bảo thư mục views tồn tại
};
export default configViewEngine;
