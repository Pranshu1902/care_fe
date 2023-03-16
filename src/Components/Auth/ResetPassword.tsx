import React, { useEffect, useState } from "react";
import { Typography, CardContent, Button } from "@material-ui/core";
import { TextInputField, ErrorHelperText } from "../Common/HelperInputFields";
import { useDispatch } from "react-redux";
import * as Notification from "../../Utils/Notifications.js";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import { postResetPassword, checkResetToken } from "../../Redux/actions";
import { navigate } from "raviger";
import { useTranslation } from "react-i18next";
import { LocalStorageKeys } from "../../Common/constants";

const panelStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
    },
  })
);

export const ResetPassword = (props: any) => {
  const panel = panelStyles();

  const dispatch: any = useDispatch();
  const initForm: any = {
    password: "",
    confirm: "",
  };

  const initErr: any = {};
  const [form, setForm] = useState(initForm);
  const [errors, setErrors] = useState(initErr);
  const [passReg, setPassReg] = useState(0);
  const { t } = useTranslation();
  const handleChange = (e: any) => {
    const { value, name } = e.target;
    const fieldValue = Object.assign({}, form);
    const errorField = Object.assign({}, errors);
    if (errorField[name]) {
      errorField[name] = null;
      setErrors(errorField);
    }
    fieldValue[name] = value;
    setPassReg(0);
    setForm(fieldValue);

    // validate form on every change
    validateData();
    console.log(errors);
  };

  const validateData = () => {
    let hasError = false;
    const err = Object.assign({}, errors);
    if (form.password !== form.confirm) {
      hasError = true;
      // setPassReg(1);
      err.confirm = t("password_mismatch");
    } else {
      err.confirm = "";
    }

    const regex = /^(?=.*[a-z]+)(?=.*[A-Z]+)(?=.*[0-9]+)(?=.*[!@#$%^&*]).{8,}$/;
    if (!regex.test(form.password)) {
      hasError = true;
      err.password = t("invalid_password");
    } else {
      err.password = "";
    }

    // sub regexs
    const digitRegex = /^(?=.*[0-9]+).{1,}$/;
    const upperRegex = /^(?=.*[A-Z]+).{1,}$/;
    const lowerRegex = /^(?=.*[a-z]+).{1,}$/;
    const symbolRegex = /^(?=.*[!@#$%^&*]).{1,}$/;

    if (!digitRegex.test(form.password)) {
      hasError = true;
      err.containsDigit = false;
    } else {
      err.containsDigit = true;
    }
    if (!upperRegex.test(form.password)) {
      hasError = true;
      err.containsUpperCase = false;
    } else {
      err.containsUpperCase = true;
    }
    if (!lowerRegex.test(form.password)) {
      hasError = true;
      err.containsLowerCase = false;
    } else {
      err.containsLowerCase = true;
    }
    if (!symbolRegex.test(form.password)) {
      hasError = true;
      err.containsSymbol = false;
    } else {
      err.containsSymbol = true;
    }
    if (form.password.length < 8) {
      hasError = true;
      err.passwordLength = false;
    } else {
      err.passwordLength = true;
    }

    Object.keys(form).forEach((key) => {
      if (!form[key]) {
        hasError = true;
        err[key] = t("field_required");
      } else {
        err[key] = "";
      }
    });
    if (hasError) {
      setErrors(err);
      return false;
    }
    return form;
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const valid = validateData();
    if (valid) {
      valid.token = props.token;
      dispatch(postResetPassword(valid)).then((resp: any) => {
        const res = resp && resp.data;
        if (res && res.status === "OK") {
          localStorage.removeItem(LocalStorageKeys.accessToken);
          Notification.Success({
            msg: t("password_reset_success"),
          });
          navigate("/login");
        } else if (res && res.data) {
          setErrors(res.data);
        } else {
          Notification.Error({
            msg: t("password_reset_failure"),
          });
        }
      });
    }
  };

  useEffect(() => {
    if (props.token) {
      dispatch(checkResetToken({ token: props.token })).then((resp: any) => {
        const res = resp && resp.data;
        if (!res || res.status !== "OK") navigate("/invalid-reset");
      });
    } else {
      navigate("/invalid-reset");
    }
  }, []);

  return (
    <div className="py-10 md:py-40">
      <div>
        <div>
          <form
            className="max-w-xl bg-white shadow rounded-lg mx-auto"
            onSubmit={(e) => {
              handleSubmit(e);
            }}
          >
            <div className="text-xl font-bold pt-4 text-center">
              {t("reset_password")}
            </div>
            <CardContent>
              <TextInputField
                type="password"
                name="password"
                placeholder={t("new_password")}
                variant="outlined"
                margin="dense"
                onChange={handleChange}
                errors={errors.password}
              />
              {passReg === 0 && (
                <div className={panel.root}>
                  <ExpansionPanel>
                    <ExpansionPanelDetails>
                      <Typography className="text-red-500">
                        <li
                          className={`${
                            errors.passwordLength && "text-primary-500"
                          }`}
                        >
                          {t("min_password_len_8")}
                        </li>
                        <li
                          className={`${
                            errors.containsDigit && "text-primary-500"
                          }`}
                        >
                          {t("req_atleast_one_digit")}
                        </li>
                        <li
                          className={`${
                            errors.containsUpperCase && "text-primary-500"
                          }`}
                        >
                          {t("req_atleast_one_uppercase")}
                        </li>
                        <li
                          className={`${
                            errors.containsLowerCase && "text-primary-500"
                          }`}
                        >
                          {t("req_atleast_one_lowercase")}
                        </li>
                        <li
                          className={`${
                            errors.containsSymbol && "text-primary-500"
                          }`}
                        >
                          {t("req_atleast_one_symbol")}
                        </li>
                      </Typography>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                </div>
              )}
              <TextInputField
                type="password"
                name="confirm"
                placeholder={t("confirm_password")}
                variant="outlined"
                margin="dense"
                onChange={handleChange}
                errors={errors.confirm}
              />
              <ErrorHelperText error={errors.token} />
            </CardContent>
            <div className="mt-4 sm:flex sm:justify-between grid p-4">
              <Button
                color="default"
                variant="contained"
                onClick={() => navigate("/login")}
                type="button"
              >
                Cancel{" "}
              </Button>
              <Button
                color="primary"
                variant="contained"
                type="submit"
                style={{ marginLeft: "auto" }}
                onClick={(e) => handleSubmit(e)}
              >
                {t("reset")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
