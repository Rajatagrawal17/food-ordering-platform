export const getCsrfToken = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      csrfToken: req.csrfToken(),
    },
  });
};