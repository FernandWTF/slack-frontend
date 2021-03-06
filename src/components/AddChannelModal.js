import { withFormik } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { Button, Container, Form as FormContainer, Header, Input, Message, Modal } from 'semantic-ui-react';
import * as yup from 'yup';
import { createChannelMutation } from '../graphql/channel';
import { allTeamsMutation } from '../graphql/team';
import { formikPropTypes } from '../utils/commonProptypes';

const AddChannelForm = ({
  handleChange,
  handleSubmit,
  touched,
  errors,
  isSubmitting,
  open,
  onClose,
}) => (
  <Modal open={open} onClose={onClose} style={{ padding: '4rem' }}>
    <Container text>
      <FormContainer onSubmit={handleSubmit} loading={isSubmitting}>
        <Header>Create channel</Header>

        <FormContainer.Field>
          <Input
            fluid
            autoFocus
            error={Boolean(touched.name && errors.name)}
            name="name"
            placeholder={(touched.name && errors.name) ? errors.name : 'name'}
            onChange={handleChange}
          />
        </FormContainer.Field>

        <FormContainer.Field>
          <Button
            fluid
            loading={isSubmitting}
            type="submit"
          >
            Create!
          </Button>
        </FormContainer.Field>
      </FormContainer>

      {errors.length > 0 && (
        <Message
          error
          header="error"
          list={errors.map(err => err.message)}
        />
      )}
    </Container>
  </Modal>
);

AddChannelForm.propTypes = {
  ...formikPropTypes,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default compose(
  withRouter,
  graphql(createChannelMutation),
  withFormik({
    mapPropsToValues: () => ({
      name: '',
    }),
    validationSchema: yup.object({
      name: yup
        .string()
        .min(1, 'name has to be min 4 length')
        .max(24, 'name has to be max 24 length')
        .required('name required'),
    }),
    handleSubmit: async (values, { props: { history, mutate, teamId, onClose }, setSubmitting, setErrors }) => {
      try {
        const { data: response } = await mutate({
          variables: { ...values, teamId },
          optimisticResponse: {
            createChannel: {
              __typename: 'Mutation',
              ok: true,
              channel: {
                __typename: 'Channel',
                name: values.name,
                _id: '-1',
              },
              errors: null,
            },
          },
          update: (store, { data: { createChannel } }) => {
            const { ok, channel } = createChannel;

            if (!ok) {
              return;
            }

            const data = store.readQuery({ query: allTeamsMutation });
            const currentTeamIdx = data.allTeams.findIndex(team => team._id === teamId);
            data.allTeams[currentTeamIdx].channels.push(channel);
            store.writeQuery({ query: allTeamsMutation, data });
          },
        });

        if (response.createChannel.errors && response.createChannel.errors.length > 0) {
          setErrors(response.createChannel.errors);
          // return setStatus();
          return;
        }

        history.replace(`/view-team/${teamId}/${response.createChannel.channel._id}`);
      } catch (error) {
        throw error;
      } finally {
        onClose();
        setSubmitting(false);
      }
    },
  }),
)(AddChannelForm);
