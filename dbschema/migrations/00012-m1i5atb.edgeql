CREATE MIGRATION m1i5atbpem3gyc7wuo2p6rk2wm2x2xzhwc3tthqozu3fytl6xt6q5q
    ONTO m16jdflvi2ltnqp2eq2ngnypm3bnfd4dl5syh2zuazu6hfutmrbjuq
{
  CREATE TYPE default::OAuth2Account EXTENDING default::Base {
      CREATE REQUIRED PROPERTY provider: std::str;
      CREATE INDEX ON (.provider);
      CREATE REQUIRED PROPERTY provider_user_id: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE INDEX ON (.provider_user_id);
      CREATE REQUIRED LINK user: default::User;
  };
  DROP TYPE default::OAuth2Provider;
};
