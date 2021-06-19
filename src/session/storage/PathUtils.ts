
class PathUtils {
  currentDir() {
    return process.env.MN_LAMBDA_PATH ? `${__dirname}/${process.env.MN_LAMBDA_PATH}` : __dirname;
  }
}

export const pathUtils = new PathUtils();
