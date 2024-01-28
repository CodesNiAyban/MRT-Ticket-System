// BeepCardFormFields.tsx
import React from "react";
import { Button } from "react-bootstrap";
import { BeepCard } from "../../../model/beepCardModel";
import TextInputField from "../../form/textInputFields";

interface BeepCardFormFieldsProps {
  editMode: boolean;
  beepCardToEdit?: BeepCard;
  register: any;
  errors: any;
  isSubmitting: boolean;
  confirming: boolean;
  generateNumber: () => void;
}

const BeepCardFormFields: React.FC<BeepCardFormFieldsProps> = ({
  editMode,
  beepCardToEdit,
  register,
  errors,
  isSubmitting,
  confirming,
  generateNumber,
}: BeepCardFormFieldsProps) => {
  return (
    <React.Fragment>
      {!editMode && beepCardToEdit ? (
        <>
          <TextInputField
            name="UUIC"
            label="Beep Card ID"
            type="text"
            placeholder="UUIC"
            register={register}
            registerOptions={{ required: "Required " }}
            errors={errors.UUIC}
            disabled
          />
          <TextInputField
            name="balance"
            label="Balance"
            type="number"
            placeholder="balance"
            register={register}
            registerOptions={{ required: "Required " }}
            errors={errors.balance}
            disabled={confirming}
          />
        </>
      ) : (
        <>
          <TextInputField
            name="UUIC"
            label="Beep Card ID"
            type="text"
            placeholder="ID"
            register={register}
            registerOptions={{ required: "Required " }}
            errors={errors.UUIC}
            disabled={isSubmitting}
          />

          {!beepCardToEdit && (
            <div className="mb-3">
              <Button variant="warning" onClick={generateNumber} disabled={isSubmitting}>
                Generate Account Number
              </Button>
            </div>
          )}

          {beepCardToEdit && (
            <TextInputField
              name="balance"
              label="Balance"
              type="number"
              placeholder="balance"
              register={register}
              registerOptions={{ required: "Required " }}
              errors={errors.balance}
              disabled={isSubmitting}
            />
          )}
        </>
      )}
    </React.Fragment>
  );
};

export default BeepCardFormFields;
