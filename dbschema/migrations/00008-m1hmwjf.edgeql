CREATE MIGRATION m1hmwjfkvmzued5rco5batc6fjuu7tmftl7jf2hy46lwcuseeqfiuq
    ONTO m1quuco62etkyyebizo4o4phkky5ou25657ryfh5nc5q4vtxcaurba
{
  ALTER TYPE default::EmailVerificationCode {
      ALTER LINK user {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::EmailVerificationCode {
      CREATE INDEX ON (.user);
  };
  ALTER TYPE default::EmailVerificationCode {
      DROP INDEX ON (.code);
      ALTER PROPERTY code {
          DROP CONSTRAINT std::exclusive;
      };
  };
};
