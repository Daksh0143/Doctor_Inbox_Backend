const { z } = require("zod");

const idParamSchema = z.object({
  id: z.string().min(1)
});

module.exports = {
  idParamSchema
};