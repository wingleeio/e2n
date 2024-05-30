CREATE MIGRATION m1iyc4stmj2mw5i5uzrhjzlppzxxwbmopww3bhmofyznll6eswmsia
    ONTO m1xi2l72jf3k25q7j7n66hymu2cjj2dgmocnzjaeivo524zekr3kuq
{
  ALTER TYPE default::User {
      CREATE REQUIRED PROPERTY email_verified: std::bool {
          SET REQUIRED USING (<std::bool>false);
      };
  };
};
