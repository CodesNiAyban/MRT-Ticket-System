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
  setValue: any;
  generateNumber: () => void;
}

const BeepCardFormFields: React.FC<BeepCardFormFieldsProps> = ({
  editMode,
  beepCardToEdit,
  register,
  errors,
  setValue,
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
          />

          {!beepCardToEdit && (
            <div className="mb-3">
              <Button variant="warning" onClick={generateNumber}>
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
            />
          )}
        </>
      )}
    </React.Fragment>
  );
};

export default BeepCardFormFields;
