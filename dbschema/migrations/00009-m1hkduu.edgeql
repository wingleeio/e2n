CREATE MIGRATION m1hkduu3caxk27q3zm66vuymnzn5bztl5ltiojxlzf6hrzc5aczmeq
    ONTO m1hmwjfkvmzued5rco5batc6fjuu7tmftl7jf2hy46lwcuseeqfiuq
{
  ALTER TYPE default::User {
      ALTER PROPERTY hashed_password {
          RESET OPTIONALITY;
      };
  };
};
