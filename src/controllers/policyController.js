const Policy = require('../models/Policy');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS, POLICY_TYPE } = require('../constants');

/**
 * Get Policy By Type
 * GET /api/policies/:type
 */
const getPolicyByType = asyncHandler(async (req, res) => {
  const { type } = req.params;

  if (type !== POLICY_TYPE.SHIPPING && type !== POLICY_TYPE.REFUND) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Invalid policy type. Must be '${POLICY_TYPE.SHIPPING}' or '${POLICY_TYPE.REFUND}'.`);
  }

  let policy = await Policy.findOne({ type });

  // Auto-seed policy if not present
  if (!policy) {
    const defaultTitle = type === POLICY_TYPE.SHIPPING ? 'Shipping Policy' : 'Refund Policy';
    policy = await Policy.create({
      title: defaultTitle,
      content: `Default ${defaultTitle} content. Please update through the admin dashboard.`,
      type,
    });
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, policy, `${policy.title} retrieved successfully.`));
});

/**
 * Update Policy By Type
 * PUT /api/policies/:type
 */
const updatePolicyByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { title, content } = req.body;

  if (type !== POLICY_TYPE.SHIPPING && type !== POLICY_TYPE.REFUND) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Invalid policy type. Must be '${POLICY_TYPE.SHIPPING}' or '${POLICY_TYPE.REFUND}'.`);
  }

  if (!title || !content) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Policy title and content are required.');
  }

  let policy = await Policy.findOne({ type });

  if (!policy) {
    policy = new Policy({ type });
  }

  policy.title = title;
  policy.content = content;

  await policy.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, policy, `${policy.title} updated successfully.`));
});

module.exports = {
  getPolicyByType,
  updatePolicyByType,
};
