CREATE MIGRATION m16jdflvi2ltnqp2eq2ngnypm3bnfd4dl5syh2zuazu6hfutmrbjuq
    ONTO m1gkwr7ju2rd2hbshtefm4q3kiwtrssveqkfwqg34faet4xvbhb7lq
{
  ALTER TYPE default::OAuth2Provider {
      ALTER PROPERTY provider_user_id {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
