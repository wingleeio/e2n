CREATE MIGRATION m1gkwr7ju2rd2hbshtefm4q3kiwtrssveqkfwqg34faet4xvbhb7lq
    ONTO m1hkduu3caxk27q3zm66vuymnzn5bztl5ltiojxlzf6hrzc5aczmeq
{
  CREATE TYPE default::OAuth2Provider EXTENDING default::Base {
      CREATE REQUIRED PROPERTY provider: std::str;
      CREATE INDEX ON (.provider);
      CREATE REQUIRED PROPERTY provider_user_id: std::str;
      CREATE INDEX ON (.provider_user_id);
      CREATE REQUIRED LINK user: default::User;
  };
};
