with
  deleted := (delete EmailVerificationCode filter .user = <User><uuid>$user_id),
  email_verification_code := (
    insert EmailVerificationCode {
      user := <User><uuid>$user_id,
      code := <str>$code,
      expires_at := <datetime>$expires_at
    }
  )
select email_verification_code {
  code,
}