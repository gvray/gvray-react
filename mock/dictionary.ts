import { Request, Response } from 'express';

export default {
  'GET /api/system/dictionaries/types/batch': async (
    req: Request,
    res: Response,
  ) => {
    const { typeCodes } = req.query;
    const codes = typeof typeCodes === 'string' ? typeCodes.split(',') : [];

    const dictionaryData: Record<
      string,
      Array<{ value: string; label: string }>
    > = {
      user_status: [
        { value: 'enabled', label: '启用' },
        { value: 'disabled', label: '禁用' },
        { value: 'pending', label: '审核中' },
        { value: 'banned', label: '封禁' },
      ],
      user_gender: [
        { value: 'unknown', label: '未知' },
        { value: 'male', label: '男' },
        { value: 'female', label: '女' },
        { value: 'other', label: '其他' },
      ],
      menu_status: [
        { value: 'enabled', label: '启用' },
        { value: 'disabled', label: '禁用' },
      ],
    };

    const result: Record<string, Array<{ value: string; label: string }>> = {};
    codes.forEach((code) => {
      if (dictionaryData[code]) {
        result[code] = dictionaryData[code];
      }
    });

    res.send({
      success: true,
      code: 200,
      message: '获取成功',
      data: result,
    });
  },
};
