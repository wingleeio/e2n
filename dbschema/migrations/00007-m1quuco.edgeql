CREATE MIGRATION m1quuco62etkyyebizo4o4phkky5ou25657ryfh5nc5q4vtxcaurba
    ONTO m1iyc4stmj2mw5i5uzrhjzlppzxxwbmopww3bhmofyznll6eswmsia
{
  CREATE TYPE default::EmailVerificationCode EXTENDING default::Base {
      CREATE REQUIRED PROPERTY code: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE INDEX ON (.code);
      CREATE REQUIRED LINK user: default::User;
      CREATE REQUIRED PROPERTY expires_at: std::datetime;
  };
};
