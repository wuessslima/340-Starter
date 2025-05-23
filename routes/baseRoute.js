// Error test route
router.get("/error-test", (req, res, next) => {
  throw new Error("Intentional 500 Error");
});