import { LOGIN_PATH } from '@/constants';
import { logger, redirectToLogin } from '@/utils';
import {
  ErrorShowType,
  GvrayConfig,
  GvrayRequestConfig,
  GvrayResponse,
} from '@gvray/request';
import { Modal, message as msg, notification } from 'antd';
import { history } from 'umi';
import { statusMap } from './constants/httpStatus';
import { BizErrorDetails, throwBizError, wrapToBizError } from './utils/errors';

// 防止多次弹出 401 对话框
let isShowingAuthModal = false;

// 处理 401 未授权错误
const handle401Unauthorized = () => {
  // 如果已经在登录页面，不需要弹窗
  if (history.location.pathname === LOGIN_PATH) {
    return;
  }

  if (isShowingAuthModal) return;

  isShowingAuthModal = true;
  Modal.confirm({
    title: '系统提示',
    content: '登录状态已过期，您可以继续留在该页面，或者重新登录',
    okText: '重新登录',
    cancelText: '取消',
    onOk: () => {
      redirectToLogin();
      isShowingAuthModal = false;
    },
    onCancel: () => {
      isShowingAuthModal = false;
    },
  });
};

const handleBizErrorMessage = (details: BizErrorDetails) => {
  const { message, code, showType } = details;

  switch (showType) {
    case ErrorShowType.SILENT:
      break;
    case ErrorShowType.WARN_MESSAGE:
      msg.warning(message);
      break;
    case ErrorShowType.ERROR_MESSAGE:
      msg.error(message);
      break;
    case ErrorShowType.NOTIFICATION:
      notification.warning({
        description: message,
        message: statusMap[code || -1] ?? `请求失败（${code}）`,
        duration: 4,
        placement: 'topRight',
      });
      break;
    case ErrorShowType.REDIRECT:
      // TODO: redirect
      break;
    default:
      // 未知 showType，统一 warn
      logger.warn('Unhandled BizError showType', details);
  }
};

export const httpConfig: GvrayConfig = {
  errorConfig: {
    // 当2xx响应的数据 success 是 false 的时候，抛出 error 以供 errorHandler 处理。
    errorThrower: (res: BizErrorDetails) => {
      throwBizError(res);
    },
    // 接受处理 axios errorThrower 抛出的错误。
    errorHandler: (error: any, opts: any) => {
      const bizError = wrapToBizError(error);
      // 如果设置了 skipErrorHandler，则直接抛出错误，不进行任何处理
      if (opts?.skipErrorHandler) {
        throw bizError;
      }

      // 处理 401 未授权错误
      if (bizError.details?.status === 401) {
        handle401Unauthorized();
        throw bizError;
      }

      // 处理其他业务错误消息
      handleBizErrorMessage(bizError.details);

      throw bizError;
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: GvrayRequestConfig) => {
      // 📌 占位：这里是请求拦截点
      // 扩展点：可在此处理 header、默认参数、请求加工等
      // HTTP logger 已全局处理，请避免重复记录日志
      return config;
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response: GvrayResponse) => {
      // 📌 Response Interceptor 扩展点，这里比 errorThrower 那拦截器早执行
      const { data } = response as unknown as BizErrorDetails;
      // 扩展点：用于业务级响应处理（仅限 HTTP 200-299）
      // 可在此做监控上报、数据预处理或缓存策略
      if (data?.success === false) {
        // 示例占位：业务异常扩展处理
        // logger.warn('business response exception');
      }
      return response;
    },
  ],
};
