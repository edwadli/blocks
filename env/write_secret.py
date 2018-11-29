from absl import app
from absl import flags
from absl import logging

from env import secret_keeper

FLAGS = flags.FLAGS

flags.DEFINE_string('name', None, 'Variable name.')
flags.DEFINE_string('value', None, 'Value of the variable.')
flags.DEFINE_string('namespace', None, 'Namespace of the variable.')


def main(argv):
    del argv  # Unused.

    logging.info('Writing secret')
    if FLAGS.namespace:
        logging.info('in namespace %s', FLAGS.namespace)
    logging.info('%s=%s', FLAGS.name, FLAGS.value)
    secret_keeper.WriteSecret(FLAGS.name, FLAGS.value, FLAGS.namespace)


if __name__ == '__main__':
    flags.mark_flag_as_required('name')
    flags.mark_flag_as_required('value')
    app.run(main)
