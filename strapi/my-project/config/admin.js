module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '656360c0422c2b048df2d8ee5c1c1dba'),
  },
});
