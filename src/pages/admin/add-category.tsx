import { Helmet } from "react-helmet-async";
import { Button } from "../../components/button";
import { FormError } from "../../components/form-error";
import { gql, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  CreateCategoryMutation,
  CreateCategoryMutationVariables,
} from "../../__generated__/graphql";
import { useHistory } from "react-router-dom";

export const CREATE_CATEGORY_MUTATION = gql`
  mutation createCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      ok
      error
    }
  }
`;

interface IFormProps {
  name: string;
  slug: string;
  file: FileList;
}

export const AddCategory = () => {
  const history = useHistory();

  const { handleSubmit, register, formState, getValues } = useForm<IFormProps>({
    mode: "onChange",
  });

  const [createCategoryMutation, { data }] = useMutation<
    CreateCategoryMutation,
    CreateCategoryMutationVariables
  >(CREATE_CATEGORY_MUTATION);

  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File) => {
    const formBody = new FormData();
    formBody.append("file", file);

    const response = await fetch(`${process.env.FILE_UPLOAD}`, {
      method: "POST",
      body: formBody,
    });

    const { url: coverImg } = await response.json();
    return coverImg;
  };

  const onSubmit = async () => {
    try {
      setUploading(true);

      const { file, name, slug } = getValues();
      const actualFile = file[0];

      const coverImg = await uploadFile(actualFile);

      await createCategoryMutation({
        variables: {
          input: {
            name,
            slug,
            coverImg,
          },
        },
      });

      history.goBack();
    } catch (e) {
      console.error("Error creating category:", e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container flex flex-col items-center mt-52">
      <Helmet>
        <title>Add Category | Nuber Eats</title>
      </Helmet>
      <h4 className="font-semibold text-2xl mb-3">Add Category</h4>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid max-w-screen-sm gap-3 mt-5 w-full mb-5"
      >
        <input
          className="input"
          type="text"
          placeholder="Name"
          minLength={2}
          {...register("name", {
            required: "Name is required",
          })}
        />
        <input
          className="input"
          type="text"
          placeholder="slug"
          {...register("slug", { required: "Slug is required" })}
        />
        <div>
          <input
            type="file"
            accept="image/*"
            {...register("file", { required: true })}
          />
        </div>
        <Button
          loading={uploading}
          canClick={formState.isValid}
          actionText="Create Category"
        />
        {data?.createCategory?.error && (
          <FormError errorMessage={data.createCategory.error} />
        )}
      </form>
    </div>
  );
};
